import { kashe } from 'kashe';

import { createImportedTracker } from './tracker';
import {
  ChunkAsset,
  ChunkRef,
  ChunkRefs,
  Chunks,
  ImportedStat,
  ImportedTracker,
  RelatedAssets,
  RelatedImported,
  RelatedImportedPack,
} from './types';
import { intentTheOrder } from './utils/intent-the-order';


const relatedToChunks = (
  importedStat: ImportedStat,
  tracker: ImportedTracker,
  initialChunkNames: string | string[]
): ImportedTracker => {
  const load: ChunkRefs = [];
  const preload: ChunkRefs = [];
  const prefetch: ChunkRefs = [];

  const chunkNames = Array.isArray(initialChunkNames) ? initialChunkNames : [initialChunkNames];

  chunkNames.forEach((chunkName) => {
    const chunk = importedStat.chunks[chunkName];
    if (!chunk) {
      throw new Error(`imported-stats: chunk "${chunkName}" was not found in stats.`);
    }

    chunk.load.forEach((chunkId) => {
      if (tracker.load.indexOf(chunkId) < 0) {
        tracker.load.push(chunkId);
        load.push(chunkId);
      }
    });

    chunk.preload.forEach((chunkId) => {
      if (tracker.preload.indexOf(chunkId) < 0) {
        tracker.preload.push(chunkId);
        preload.push(chunkId);
      }
    });
    chunk.prefetch.forEach((chunkId) => {
      if (tracker.prefetch.indexOf(chunkId) < 0) {
        tracker.prefetch.push(chunkId);
        prefetch.push(chunkId);
      }
    });
  });

  return {
    load,
    preload,
    prefetch,
  };
};

const flattenType = (types: ChunkAsset[]): Record<string, string[]> => {
  const ret: Record<string, string[]> = {};
  types.forEach((chunk) => {
    Object.keys(chunk).forEach((type) => {
      if (!(type in ret)) {
        ret[type] = [];
      }
      ret[type].push(...chunk[type]);
    });
  });

  return ret;
};

const importedScripts = (importedStep: RelatedImported): RelatedAssets => {
  const { load, preload, prefetch } = importedStep;
  return {
    load: load.js || [],
    preload: preload.js || [],
    prefetch: prefetch.js || [],
  };
};

const importedStyles = (importedStep: RelatedImported): RelatedAssets => {
  const { load, preload, prefetch } = importedStep;

  return {
    load: load.css || [],
    preload: preload.css || [],
    prefetch: prefetch.css || [],
  };
};

type OrderMap = Map<ChunkRef, number>;
const cachedOrder = kashe(
  (chunks: Chunks): OrderMap => {
    const order: ChunkRefs = intentTheOrder(...Object.values(chunks).map(({ load }) => load));
    const map: OrderMap = new Map();
    order.forEach((x, index) => map.set(x, index));
    return map;
  }
);

const correctOrder = (order: OrderMap, load: ChunkRefs) => {
  load.sort((a, b) => order.get(a)! - order.get(b)!);
  return load;
};

export const importAssets = (
  importedStat: ImportedStat,
  chunkNames: string | string[],
  tracker: ImportedTracker = createImportedTracker()
): RelatedImportedPack => {
  const { load, preload, prefetch } = relatedToChunks(importedStat, tracker, chunkNames);
  const order = cachedOrder(importedStat.chunks);
  const raw: RelatedImported = {
    load: flattenType(correctOrder(order, load).map((chunkId) => importedStat.chunkMap[chunkId])),
    preload: flattenType(correctOrder(order, preload).map((chunkId) => importedStat.chunkMap[chunkId])),
    prefetch: flattenType(correctOrder(order, prefetch).map((chunkId) => importedStat.chunkMap[chunkId])),
  };

  return {
    raw,
    scripts: importedScripts(raw),
    styles: importedStyles(raw),
  };
};
