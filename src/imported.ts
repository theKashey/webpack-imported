import {ChunkAsset, ImportedStat, ImportedTracker, RelatedAssets, RelatedImported, RelatedImportedPack} from "./types";
import {createImportedTracker} from "./tracker";

const relatedToChunks = (importedStat: ImportedStat, tracker: ImportedTracker, initialChunkNames: string | string[]): ImportedTracker => {
  const load: number[] = [];
  const preload: number[] = [];

  const chunkNames = Array.isArray(initialChunkNames) ? initialChunkNames : [initialChunkNames];

  chunkNames.forEach(chunkName => {
    const chunk = importedStat.chunks[chunkName];
    if (!chunk) {
      throw new Error(`imported-stats: chunk "${chunkName}" was not found in stats.`);
    }

    chunk.load.forEach(chunkId => {
      if (tracker.load.indexOf(chunkId) < 0) {
        tracker.load.push(chunkId);
        load.push(chunkId)
      }
    });

    chunk.preload.forEach(chunkId => {
      if (tracker.preload.indexOf(chunkId) < 0) {
        tracker.preload.push(chunkId);
        preload.push(chunkId)
      }
    })
  });

  return {
    load,
    preload,
  }
};

const flattenType = (types: ChunkAsset[]): Record<string, string[]> => {
  const ret: Record<string, string[]> = {};
  types.forEach(chunk => {
    Object.keys(chunk).forEach(type => {
      if (!(type in ret)) {
        ret[type] = [];
      }
      ret[type].push(...chunk[type]);
    })
  });

  return ret;
};

const importedScripts = (importedStep: RelatedImported): RelatedAssets => {
  const {load, preload} = importedStep;
  return {
    load: load.js || [],
    preload: preload.js || [],
  }
};

const importedStyles = (importedStep: RelatedImported): RelatedAssets => {
  const {load, preload} = importedStep;

  return {
    load: load.css || [],
    preload: preload.css || [],
  }
};

export const importAssets = (importedStat: ImportedStat, chunkNames: string | string[], tracker: ImportedTracker = createImportedTracker()): RelatedImportedPack => {
  const {load, preload} = relatedToChunks(importedStat, tracker, chunkNames);
  const raw: RelatedImported = {
    load: flattenType(load.map(chunkId => importedStat.chunkMap[chunkId])),
    preload: flattenType(preload.map(chunkId => importedStat.chunkMap[chunkId])),
  };

  return {
    raw,
    scripts: importedScripts(raw),
    styles: importedStyles(raw),
  }
};