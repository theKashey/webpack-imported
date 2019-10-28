import * as React from "react";
import {useContext} from "react";
import {PrefetchChunkCollectorContext} from "./context";
import {ImportedStat} from "../types";
import {importAssets} from "../imported";
import {LoadCriticalStyle, LoadScript, LoadStyle} from "./Prefetch";

export interface WebpackImportProps {
  stats: ImportedStat;
  chunks: string | string[];
  prefetch?: boolean;
  anonymous?: boolean;
  async?: boolean;
  module?: boolean;
  criticalCSS?: boolean;
  publicPath?: string;
}

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
          <LoadScript prefetch={prefetch} href={`${publicPath}${asset}`} async={async} module={module} anonymous={anonymous}/>
        ))
      }

      {
        styles.load.map(asset => (
          criticalCSS
            ? <LoadCriticalStyle href={`${publicPath}${asset}`}/>
            : <LoadStyle href={`${publicPath}${asset}`}/>
        ))
      }
    </>
  )
};