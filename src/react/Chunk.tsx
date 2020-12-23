import * as React from "react";
import {useContext} from "react";
import {PrefetchChunkCollectorContext} from "./context";
import {ImportedStat} from "../types";
import {importAssets} from "../imported";
import {LoadCriticalStyle, LoadScript, LoadStyle} from "./Load";
import {PrefetchScript, PrefetchStyle, PreloadScript, PreloadStyle} from "./Atoms";

export interface WebpackImportProps {
  /**
   * reference to `imported.stat`
   */
  stats: ImportedStat;
  /**
   * list of chunks to load
   */
  chunks: string | string[];
  /**
   * should prefetch or preload be used
   */
  scriptsHint?: 'prefetch' | 'preload'
  /**
   * should scripts be loaded as anonymous
   */
  anonymous?: boolean;
  /**
   * should scripts be loaded as async (default is defer)
   */
  async?: boolean;
  /**
   * should scripts be loaded as ESM modules
   */
  module?: boolean;
  /**
   * should found CSS files be considered as critical and NOT loaded
   * and if yes - should they be prefetched or preloaded (or nothing)
   */
  criticalCSS?: boolean | "prefetch" | "preload";
  /**
   * public path for all assets
   */
  publicPath?: string;
}

/**
 * Preloads all given chunks
 * @example
 * <WebpackImport
 *  stats={data}
 *  chunks={chunks}
 *  async={priority >= 0}
 *  scriptsHint={priority >= 1 ? 'preload' : 'prefetch'}
 *  criticalCSS="prefetch"
 *  publicPath={`${CDN}${data.config.publicPath}${mode}/`}
 * />
 */
export const WebpackImport: React.FC<WebpackImportProps> = (
  {
    stats,
    chunks,
    scriptsHint,
    criticalCSS,
    anonymous,
    async = true,
    module,
    publicPath = stats.config.publicPath
  }) => {
  const tracker = useContext(PrefetchChunkCollectorContext);
  const {scripts, styles} = importAssets(stats, chunks, tracker);

  return (
    <>
      {
        scripts.load.map(asset => (
          <React.Fragment key={asset}>
            {scriptsHint === 'prefetch' && <PrefetchScript href={`${publicPath}${asset}`} anonymous={anonymous}/>}
            {scriptsHint === 'preload' && <PreloadScript href={`${publicPath}${asset}`} anonymous={anonymous}/>}
            <LoadScript
              href={`${publicPath}${asset}`}
              async={async}
              module={module}
              anonymous={anonymous}
            />
          </React.Fragment>
        ))
      }
      {
        scripts.preload.map(asset => (
            <PreloadScript key={asset} href={`${publicPath}${asset}`} anonymous={anonymous}/>
        ))
      }
      {
        scripts.prefetch.map(asset => (
          <PrefetchScript key={asset} href={`${publicPath}${asset}`} anonymous={anonymous}/>
        ))
      }

      {
        styles.load.map(asset => (
          <React.Fragment key={asset}>
            {
              criticalCSS
                ? (
                  <>
                    {criticalCSS === "prefetch" && <PrefetchStyle href={`${publicPath}${asset}`}/>}
                    {criticalCSS === "preload" && <PreloadStyle href={`${publicPath}${asset}`}/>}
                    <LoadCriticalStyle href={`${publicPath}${asset}`}/>
                  </>
                )
                : <LoadStyle href={`${publicPath}${asset}`}/>
            }
          </React.Fragment>
        ))
      }
    </>
  )
};

export interface WebpackPreloadProps {
  /**
   * reference to `imported.stat`
   */
  stats: ImportedStat;
  /**
   * list of chunks to load
   */
  chunks: string | string[];
  /**
   * should prefetch or preload be used
   */
  scriptsHint: 'prefetch' | 'preload';
  /**
   * should prefetch or preload be used
   */
  stylesHint: 'prefetch' | 'preload'
  /**
   * should scripts be loaded as anonymous
   */
  anonymous?: boolean;
  /**
   * public path for all assets
   */
  publicPath?: string;
}

/**
 * Preloads(or prefetches) all given chunks
 *
 * @example
 * <WebpackPreload
 *  stats={data}
 *  chunks={getMarkedChunks(marks)}
 *  scriptsHint={preload ? 'preload' : 'prefetch'}
 *  stylesHint='prefetch'
 *  publicPath={`${CDN}${data.config.publicPath}${mode}/`}
 * />
 */
export const WebpackPreload: React.FC<WebpackPreloadProps> = (
  {
    stats,
    chunks,
    scriptsHint,
    stylesHint,
    anonymous,
    publicPath = stats.config.publicPath
  }) => {
  const tracker = useContext(PrefetchChunkCollectorContext);
  const {scripts, styles} = importAssets(stats, chunks, tracker);

  return (
    <>
      {
        scripts.load.map(asset => (
          <React.Fragment key={asset}>
            {
              scriptsHint === 'prefetch'
                ? <PrefetchScript href={`${publicPath}${asset}`} anonymous={anonymous}/>
                : <PreloadScript href={`${publicPath}${asset}`} anonymous={anonymous}/>
            }
          </React.Fragment>
        ))
      }
      {
        styles.load.map(asset => (
          <React.Fragment key={asset}>
            {
              stylesHint === 'prefetch'
                ? <PrefetchStyle href={`${publicPath}${asset}`}/>
                : <PreloadStyle href={`${publicPath}${asset}`}/>
            }
          </React.Fragment>
        ))
      }
    </>
  )
};