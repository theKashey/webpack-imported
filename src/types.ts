export interface Chunk {
  load: number[];
  preload: number[];
  prefetch: number[];
}

export interface Asset {
  name: string,
  size: number,
  type: string,
}

export type ChunkAsset = Record<string, string[]>;

export type Chunks = Record<string, Chunk>;
export type ChunkMap = Record<number, ChunkAsset>;

/**
 * Structure representing the saved file
 */
export interface ImportedStat {
  config: {
    publicPath: string,
    outputPath: string,
    aliases: Record<string, string>,
  },
  chunks: Chunks,
  chunkMap: ChunkMap,
  assets: Asset[];
  moduleMap: Record<string, number>;
}

export interface ImportedTracker {
  load: number[],
  preload: number[],
  prefetch: number[]
}

export interface RelatedAssets {
  load: string[],
  preload: string[],
  prefetch: string[],
}

export interface RelatedImported {
  load: Record<string, string[]>,
  preload: Record<string, string[]>,
  prefetch: Record<string, string[]>,
}

export interface RelatedImportedPack {
  raw: RelatedImported,
  scripts: RelatedAssets,
  styles: RelatedAssets,
}