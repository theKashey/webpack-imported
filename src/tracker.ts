import {ImportedTracker} from "./types";

/**
 * creates a tracker - structure which holds information of referenced assets
 * Used to prevent resource duplication
 * @see {@link https://github.com/theKashey/webpack-imported#ssr-api}
 * @example
 * const tracker = createImportedTracker();
 * const relatedAssets1 = importedAssets(importedStat, ['main'], tracker);
 */
export const createImportedTracker = (): ImportedTracker => ({
  load: [],
  preload: [],
});