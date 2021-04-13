import { ImportedStat } from '../types';
import { intentTheOrder } from '../utils/intent-the-order';

export const stylesheetCorrectOrder = (
  /**
   * reference to `imported.stat`
   */
  stats: ImportedStat
) => {
  return intentTheOrder(...Object.values(stats.chunks).map(({ load }) => load));
};
