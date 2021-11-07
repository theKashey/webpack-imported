import { writeFileSync } from 'fs';
import { extname, relative } from 'path';

import { Compiler, Plugin, compilation, Configuration, Stats } from 'webpack';

import { ChunkMap, Chunks, ImportedStat, Asset } from './types';

const merge = require('lodash/merge');

type WebStats = Required<
  Pick<Stats.ToJsonOutput, 'chunks' | 'assets' | 'namedChunkGroups' | 'publicPath' | 'outputPath'>
>;

const moduleToChunks = ({ chunks }: WebStats) => {
  const manifest: Record<string, number | string> = {};
  chunks.forEach(({ id, modules }) => {
    if (modules) {
      modules.forEach((module: Stats.FnModules) => {
        manifest[module.id] = id;
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
    chunks.forEach((chunk) => {
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
  Object.keys(namedChunkGroups!).reduce((acc, key) => {
    const { chunks, children } = namedChunkGroups[key];
    acc[key] = {
      load: chunks,
      preload: children.preload ? extractPrefetch(children.preload as any) : [],
      prefetch: children.prefetch ? extractPrefetch(children.prefetch as any) : [],
    };

    return acc;
  }, {} as Chunks);

const resolveAliases = (cwd: string, aliases: Record<string, string | string[]>): Record<string, string | string[]> => {
  const alias = aliases[key];
  const paths = Array.isArray(alias) ? alias.map(aliasPath => relative(cwd, aliasPath)) : relative(cwd, alias);
  return Object.keys(aliases).reduce((acc, key) => ({ ...acc, [key]: paths }), {})
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
export class ImportedPlugin implements Plugin {
  constructor(private output: string, private options: Options = {}, private cache = {}) {}

  emitCallback = (compilation: compilation.Compilation, done: () => void) => {
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
    const aliases = resolveAliases(cwd, ((compilation as any).options as Configuration).resolve!.alias || {});
    // const {publicPath, outputPath} = stats;

    const result: ImportedStat = importStats(stats, { aliases });

    if (this.cache) {
      this.cache = merge(this.cache, result);
    }

    const stringResult = JSON.stringify(result, null, 2);

    if (this.output) {
      compilation.assets[this.output] = {
        size() {
          return stringResult.length;
        },
        source() {
          return stringResult;
        },
      };
    }

    if (this.options.saveToFile) {
      writeFileSync(this.options.saveToFile, stringResult);
    }

    done();
  };

  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync('ImportedPlugin', this.emitCallback);
  }
}
