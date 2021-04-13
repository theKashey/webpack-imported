import { intentTheOrder } from './intent-the-order';

describe('css-order', () => {
  it('merges simple order', () => {
    expect(intentTheOrder([], [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('merges overlapping order', () => {
    expect(intentTheOrder([1, 3], [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('merges not overlapping order', () => {
    expect(intentTheOrder([1, 4], [1, 2, 3])).toEqual([1, 4, 2, 3]);
  });

  it('merges not overlapping order with extra info', () => {
    expect(intentTheOrder([1, 4], [1, 2, 3], [3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('merges complex case', () => {
    expect(intentTheOrder(['start'], [1, 4], ['gap'], ['tail'], [1, 2, 3], [3, 4], ['end', 'tail'], ['end'])).toEqual([
      'start',
      1,
      2,
      3,
      4,
      'gap',
      'end',
      'tail',
    ]);
  });
});
