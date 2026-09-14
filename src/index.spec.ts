import {
  destroy,
  first,
  forEach,
  inArray,
  last,
  mapToReduce,
  push,
  reduceDistinct,
  refresh,
  remove
} from '.';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Daniel' },
  { id: 2, name: 'Andrés' },
  { id: 3, name: 'Pedro' }
];

describe('inArray', () => {
  it('should return true when the element is contained', () => {
    expect(inArray([1, 2, 3], 2)).toBe(true);
    expect(inArray(['a', 'b'], 'a')).toBe(true);
  });

  it('should return false when the element is not contained', () => {
    expect(inArray([1, 2, 3], 4)).toBe(false);
    expect(inArray([], 1)).toBe(false);
  });

  it('should compare objects by reference', () => {
    const user = users[0];

    expect(inArray(users, user)).toBe(true);
    expect(inArray(users, { ...user })).toBe(false);
  });
});

describe('first', () => {
  it('should return the first element', () => {
    expect(first([10, 20, 30])).toBe(10);
    expect(first(users)).toBe(users[0]);
  });

  it('should return null when the array is empty', () => {
    expect(first([])).toBeNull();
  });

  it('should return falsy first elements as they are', () => {
    expect(first([0, 1])).toBe(0);
    expect(first([undefined, 1])).toBeUndefined();
  });
});

describe('last', () => {
  it('should return the last element', () => {
    expect(last([10, 20, 30])).toBe(30);
    expect(last(users)).toBe(users[2]);
  });

  it('should return the only element when the array has one item', () => {
    expect(last([7])).toBe(7);
  });

  it('should return null when the array is empty', () => {
    expect(last([])).toBeNull();
  });
});

describe('push', () => {
  it('should return a new array with the element appended', () => {
    expect(push([1, 2], 3)).toEqual([1, 2, 3]);
    expect(push([], 'a')).toEqual(['a']);
  });

  it('should not mutate the original array', () => {
    const source = [1, 2];
    const result = push(source, 3);

    expect(source).toEqual([1, 2]);
    expect(result).not.toBe(source);
  });
});

describe('refresh', () => {
  it('should replace every element matching the criteria', () => {
    const replacement: User = { id: 2, name: 'Castillo' };

    expect(refresh(users, replacement, (user) => user.id === 2)).toEqual([
      users[0],
      replacement,
      users[2]
    ]);
  });

  it('should replace multiple matches with the same element', () => {
    expect(refresh([1, 2, 1, 3], 0, (value) => value === 1)).toEqual([
      0, 2, 0, 3
    ]);
  });

  it('should return an equal array when nothing matches', () => {
    const result = refresh(users, { id: 9, name: 'X' }, () => false);

    expect(result).toEqual(users);
    expect(result).not.toBe(users);
  });

  it('should not mutate the original array', () => {
    const source = [1, 2, 3];

    refresh(source, 0, (value) => value === 2);

    expect(source).toEqual([1, 2, 3]);
  });
});

describe('destroy', () => {
  it('should remove every element matching the criteria', () => {
    expect(destroy(users, (user) => user.id === 1)).toEqual([
      users[1],
      users[2]
    ]);
    expect(destroy([1, 2, 3, 4], (value) => value % 2 === 0)).toEqual([1, 3]);
  });

  it('should return an empty array when everything matches', () => {
    expect(destroy([1, 2, 3], () => true)).toEqual([]);
  });

  it('should return an equal array when nothing matches', () => {
    expect(destroy([1, 2, 3], () => false)).toEqual([1, 2, 3]);
  });

  it('should not mutate the original array', () => {
    const source = [1, 2, 3];

    destroy(source, (value) => value === 2);

    expect(source).toEqual([1, 2, 3]);
  });
});

describe('remove', () => {
  it('should remove the element located at the index', () => {
    expect(remove([10, 20, 30], 0)).toEqual([20, 30]);
    expect(remove([10, 20, 30], 1)).toEqual([10, 30]);
    expect(remove([10, 20, 30], 2)).toEqual([10, 20]);
  });

  it('should return an equal array when the index is out of range', () => {
    expect(remove([10, 20, 30], 5)).toEqual([10, 20, 30]);
    expect(remove([10, 20, 30], -1)).toEqual([10, 20, 30]);
  });

  it('should not mutate the original array', () => {
    const source = [10, 20, 30];

    remove(source, 1);

    expect(source).toEqual([10, 20, 30]);
  });
});

describe('forEach', () => {
  it('should iterate all elements and return true when never broken', () => {
    const visited: number[] = [];

    const completed = forEach({
      array: [1, 2, 3],
      callback: (value) => {
        visited.push(value as number);
      }
    });

    expect(completed).toBe(true);
    expect(visited).toEqual([1, 2, 3]);
  });

  it('should provide the index to the callback', () => {
    const indexes: number[] = [];

    forEach({
      array: ['a', 'b', 'c'],
      callback: (_, index) => {
        indexes.push(index);
      }
    });

    expect(indexes).toEqual([0, 1, 2]);
  });

  it('should break the loop and return false when callback returns true', () => {
    const visited: number[] = [];

    const completed = forEach({
      array: [1, 2, 3, 4],
      callback: (value) => {
        visited.push(value as number);

        return value === 3;
      }
    });

    expect(completed).toBe(false);
    expect(visited).toEqual([1, 2, 3]);
  });

  it('should invoke catchError with the element and index that broke the loop', () => {
    const catchError = vi.fn();

    forEach({
      array: [10, 20, 30, 40],
      callback: (value) => value === 30,
      catchError
    });

    expect(catchError).toHaveBeenCalledTimes(1);
    expect(catchError).toHaveBeenCalledWith(30, 2);
  });

  it('should not invoke catchError when the loop completes', () => {
    const catchError = vi.fn();

    const completed = forEach({
      array: [1, 2, 3],
      callback: () => false,
      catchError
    });

    expect(completed).toBe(true);
    expect(catchError).not.toHaveBeenCalled();
  });

  it('should return true for an empty array', () => {
    const fnEach = vi.fn();

    expect(forEach({ array: [], callback: fnEach })).toBe(true);
    expect(fnEach).not.toHaveBeenCalled();
  });

  it('should return false and swallow errors thrown by the callback', () => {
    const catchError = vi.fn();

    const completed = forEach({
      array: [1, 2, 3],
      callback: () => {
        throw new Error('Unexpected');
      },
      catchError
    });

    expect(completed).toBe(false);
    expect(catchError).not.toHaveBeenCalled();
  });
});

describe('reduceDistinct', () => {
  it('should keep only distinct projected values preserving order', () => {
    const cities = [
      { city: 'Bogotá' },
      { city: 'Medellín' },
      { city: 'Bogotá' },
      { city: 'Cali' },
      { city: 'Medellín' }
    ];

    expect(reduceDistinct(cities, (item) => item.city)).toEqual([
      'Bogotá',
      'Medellín',
      'Cali'
    ]);
  });

  it('should return every value when all are distinct', () => {
    expect(reduceDistinct([1, 2, 3], (value) => value * 2)).toEqual([2, 4, 6]);
  });

  it('should return an empty array for an empty input', () => {
    expect(reduceDistinct([], (value) => value)).toEqual([]);
  });

  it('should treat distinct object references as different values', () => {
    const result = reduceDistinct([1, 1], (value) => ({ value }));

    expect(result).toEqual([{ value: 1 }, { value: 1 }]);
  });
});

describe('mapToReduce', () => {
  interface Line {
    invoice: string;
    total: number;
  }

  interface Invoice {
    invoice: string;
    total: number;
  }

  const lines: Line[] = [
    { invoice: 'A', total: 100 },
    { invoice: 'A', total: 50 },
    { invoice: 'B', total: 30 }
  ];

  it('should group elements by identifier and reduce them into one value', () => {
    const result = mapToReduce<Line, Invoice>(lines, {
      identifier: (line) => line.invoice,
      elementToValue: (line) => ({ invoice: line.invoice, total: 0 }),
      reducer: (line, value) => {
        value.total += line.total;
      }
    });

    expect(result).toEqual([
      { invoice: 'A', total: 150 },
      { invoice: 'B', total: 30 }
    ]);
  });

  it('should preserve the order of first appearance of each identifier', () => {
    const result = mapToReduce<Line, string[]>(
      [
        { invoice: 'B', total: 1 },
        { invoice: 'A', total: 2 },
        { invoice: 'B', total: 3 }
      ],
      {
        identifier: (line) => line.invoice,
        elementToValue: () => [],
        reducer: (line, value) => {
          value.push(String(line.total));
        }
      }
    );

    expect(result).toEqual([['1', '3'], ['2']]);
  });

  it('should call elementToValue once per distinct identifier', () => {
    const elementToValue = vi.fn(
      (line: Line): Invoice => ({ invoice: line.invoice, total: 0 })
    );

    mapToReduce(lines, {
      identifier: (line) => line.invoice,
      elementToValue,
      reducer: () => {}
    });

    expect(elementToValue).toHaveBeenCalledTimes(2);
  });

  it('should call reducer once per element', () => {
    const reducer = vi.fn();

    mapToReduce(lines, {
      identifier: (line) => line.invoice,
      elementToValue: (line) => ({ invoice: line.invoice, total: 0 }),
      reducer
    });

    expect(reducer).toHaveBeenCalledTimes(3);
  });

  it('should return an empty array for an empty input', () => {
    const result = mapToReduce<Line, Invoice>([], {
      identifier: (line) => line.invoice,
      elementToValue: (line) => ({ invoice: line.invoice, total: 0 }),
      reducer: () => {}
    });

    expect(result).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const source = lines.map((line) => ({ ...line }));

    mapToReduce<Line, Invoice>(source, {
      identifier: (line) => line.invoice,
      elementToValue: (line) => ({ invoice: line.invoice, total: 0 }),
      reducer: (line, value) => {
        value.total += line.total;
      }
    });

    expect(source).toEqual(lines);
  });
});
