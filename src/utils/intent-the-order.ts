/* eslint-disable no-param-reassign */
type PairMap = Record<string, Record<string, boolean>>;

const putPair = (map: PairMap, a: any, b: any) => {
  if (!('a' in map)) {
    map[a] = {};
  }
  map[a][b] = true;
};

const getPair = (map: PairMap, a: any, b: any) => {
  return map[a] ? map[a][b] : undefined;
};

const getPairDeep = (map: PairMap, a: any, b: any): boolean => {
  if (getPair(map, a, b)) {
    return true;
  }
  const variants = map[a];
  return variants && Object.keys(variants).some((x) => getPairDeep(map, x, b));
};

/**
 * restores the original order of pieces presented in different subsets
 * @param sets
 */
export const intentTheOrder = (...sets: any[][]): any[] => {
  const result: any[] = [];
  const map: PairMap = {};
  const knownValues = new Set<any>();

  // create a<b map
  sets.forEach((set) => {
    for (let i = 0; i < set.length - 1; i += 1) {
      putPair(map, set[i], set[i + 1]);
      knownValues.add(set[i]);
    }
  });

  const savedValues = new Set<any>();

  const push = (v: any) => {
    if (savedValues.has(v)) {
      return;
    }
    savedValues.add(v);

    for (let index = 0; index <= result.length; index += 1) {
      const mapv = result[index];
      // v is known to be < mapv
      if (getPairDeep(map, v, mapv)) {
        result.splice(index, 0, v);
        return;
      }
    }
    result.push(v);
  };
  sets.forEach((set) => set.forEach((x) => push(x)));

  return result;
};
