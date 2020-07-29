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
  prefetch?: 'prefetch' | 'preload'
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
 */
export const WebpackImport: React.FC<WebpackImportProps> = (
  {
    stats,
    chunks,
    prefetch,
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
          <>
            {prefetch === 'prefetch' && <PrefetchScript href={`${publicPath}${asset}`} anonymous={anonymous}/>}
            {prefetch === 'preload' && <PreloadScript href={`${publicPath}${asset}`} anonymous={anonymous}/>}
            <LoadScript
              href={`${publicPath}${asset}`}
              async={async}
              module={module}
              anonymous={anonymous}
            />
          </>
        ))
      }

      {
        styles.load.map(asset => (
          criticalCSS
            ? (
              <>
                {criticalCSS === "prefetch" && <PrefetchStyle href={`${publicPath}${asset}`}/>}
                {criticalCSS === "preload" && <PreloadStyle href={`${publicPath}${asset}`}/>}
                <LoadCriticalStyle href={`${publicPath}${asset}`}/>
              </>
            )
            : <LoadStyle href={`${publicPath}${asset}`}/>
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
  mode: 'prefetch' | 'preload'
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
 * Preloads all given chunks
 */
export const WebpackPreload: React.FC<WebpackPreloadProps> = (
  {
    stats,
    chunks,
    mode,
    anonymous,
    publicPath = stats.config.publicPath
  }) => {
  const tracker = useContext(PrefetchChunkCollectorContext);
  const {scripts, styles} = importAssets(stats, chunks, tracker);

  return (
    <>
      {
        scripts.load.map(asset => (
          mode === 'prefetch'
            ? <PrefetchScript href={`${publicPath}${asset}`} anonymous={anonymous}/>
            : <PreloadScript href={`${publicPath}${asset}`} anonymous={anonymous}/>
        ))
      }
      {
        styles.load.map(asset => (
          mode === 'prefetch'
            ? <PrefetchStyle href={`${publicPath}${asset}`}/>
            : <PreloadStyle href={`${publicPath}${asset}`}/>
        ))
      }
    </>
  )
};