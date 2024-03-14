import { writeFileSync } from 'fs';
import { extname, relative } from 'path';

import { Compiler, Compilation, sources, StatsModule, StatsCompilation } from 'webpack';

import { ChunkMap, Chunks, ImportedStat, Asset } from './types';

const merge = require('lodash/merge');

type WebStats = Required<
  Pick<StatsCompilation, 'chunks' | 'assets' | 'namedChunkGroups' | 'publicPath' | 'outputPath'>
>;

const moduleToChunks = ({ chunks }: WebStats) => {
  const manifest: Record<string, number | string> = {};
  chunks.forEach(({ id, modules }) => {
    if (modules) {
      modules.forEach((module: StatsModule) => {
        if (module.id && id) manifest[module.id] = id;
      });
    }
  });

  return manifest;
};

const getAssetType = (name: string) => extname(name).substr(1);

const extractPrefetch = (prefetch: any[] = []): number[] =>
  Array.from(
    prefetch
      .map(({ chunks }) => chunks as number[])
      .reduce((acc, chunks) => {
        chunks.forEach((chunk) => acc.add(chunk));

        return acc;
      }, new Set<number>())
  );

const mapChunkNumbers = ({ assets }: WebStats): ChunkMap =>
  assets.reduce((acc, { name, chunks }) => {
    chunks?.forEach((chunk) => {
      acc[chunk] = acc[chunk] || {};
      const type = getAssetType(name);
      acc[chunk][type] = acc[chunk][type] || [];
      acc[chunk][type].push(name);
    });

    return acc;
  }, {} as ChunkMap);

const getAssets = ({ assets }: WebStats): Asset[] =>
  assets!.map(({ name, size }) => ({ name, size, type: getAssetType(name) }));

const getChunks = ({ namedChunkGroups }: WebStats): Chunks =>
  Object.keys(namedChunkGroups).reduce((acc, key) => {
    const { chunks, children } = namedChunkGroups[key];
    acc[key] = {
      load: chunks || [],
      preload: children?.preload ? extractPrefetch(children.preload) : [],
      prefetch: children?.prefetch ? extractPrefetch(children.prefetch) : [],
    };

    return acc;
  }, {} as Chunks);

const resolveAliases = (cwd: string, aliases: Record<string, string | string[]>): Record<string, string | string[]> => {
  return Object.keys(aliases).reduce((acc, key) => {
    const alias = aliases[key];
    const paths = Array.isArray(alias) ? alias.map((aliasPath) => relative(cwd, aliasPath)) : relative(cwd, alias);
    return { ...acc, [key]: paths };
  }, {});
};

export const importStats = (stats: WebStats, extraProps: Record<string, any> = {}): ImportedStat => {
  const cwd = process.cwd();
  const { publicPath, outputPath } = stats;

  return {
    config: {
      publicPath,
      outputPath: relative(cwd, outputPath),
      aliases: {},
      ...extraProps,
    },

    chunks: getChunks(stats),
    chunkMap: mapChunkNumbers(stats),
    assets: getAssets(stats),
    moduleMap: moduleToChunks(stats),
  };
};

interface Options {
  /**
   * bypasses webpack and saves file directly to the FS
   */
  saveToFile?: string;
}

/**
 * Webpack plugin
 */
export class ImportedPlugin {
  constructor(private output: string, private options: Options = {}, private cache = {}) {}

  handleEmit = (compilation: Compilation) => {
    const stats = compilation.getStats().toJson({
      hash: true,
      publicPath: true,
      assets: true,
      chunks: true,
      modules: false,
      source: false,
      errorDetails: false,
      timings: false,
    }) as WebStats;

    const cwd = process.cwd();
    // not quite yet
    // const modules = compilation.options.resolve.modules;
    const aliases = resolveAliases(cwd, (compilation as any).options.resolve!.alias || {});
    // const {publicPath, outputPath} = stats;

    const result: ImportedStat = importStats(stats, { aliases });

    if (this.cache) {
      this.cache = merge(this.cache, result);
    }

    const stringResult = JSON.stringify(result, null, 2);

    if (this.options.saveToFile) {
      writeFileSync(this.options.saveToFile, stringResult);
    }

    if (this.output) {
      return {
        source() {
          return stringResult;
        },
        size() {
          return stringResult.length;
        },
      };
    }

    return null;
  };

  apply(compiler: Compiler) {
    const version = 'jsonpFunction' in compiler.options.output ? 4 : 5;

    if (version === 4) {
      compiler.hooks.emit.tap('ImportedPlugin', (compilation) => {
        const asset = this.handleEmit(compilation);
        if (asset) {
          compilation.assets[this.output] = asset as sources.Source;
        }
      });
    } else {
      compiler.hooks.make.tap('ImportedPlugin', (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'ImportedPlugin',
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const asset = this.handleEmit(compilation);
            if (asset) {
              compilation.emitAsset(this.output, asset as sources.Source);
            }
          }
        );
      });
    }
  }
}
