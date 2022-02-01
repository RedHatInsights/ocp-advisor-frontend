/**
 * Generate all possible combinations of items in arr
 * considering combinations of all possible sizes
 * @param {} arr
 * @param {*} current -- do not provide
 *
 * [1,2,3] -> [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]
 */
function* cumulativeCombinations(arr, current = []) {
  let i = 0;
  while (i < arr.length) {
    let next = current.concat(arr[i]);
    yield next;
    i++;
    if (next.length <= arr.length) {
      yield* cumulativeCombinations(arr.slice(i), next);
    }
  }
}

/**
 * Combine together options from different fields.
 * Picks only one item per key at most
 * @param {*} data {k1: [v11, v12]}
 * @param {*} fields restrict to a subset of keys in data
 *
 * {a: [1,2], b: [3]} -> {a:1}, {a:2}, {b:3}, {a:1,b3}, {a:2,b:3}
 */
function* combineFields(data, fields = null) {
  if (fields == null) {
    fields = Object.keys(data);
  }
  if (fields.length > 0) {
    const field = fields.pop();
    for (let x of combineFields(data, fields)) {
      yield x;
      for (let y of data[field]) {
        const obj = { ...x };
        obj[field] = y;
        yield obj;
      }
    }
  } else {
    yield {};
  }
}

export { cumulativeCombinations, combineFields, slide, slideHalf };
