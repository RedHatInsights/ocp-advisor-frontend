import { DEFAULT_ROW_COUNT } from './defaults';

// FIXME improve syntax
function itemsPerPage(totalLength, pageSize = DEFAULT_ROW_COUNT) {
  let items = totalLength;
  const array = [];
  while (items > 0) {
    const remain = items - pageSize;
    let v = remain > 0 ? pageSize : items;
    array.push(v);
    items = remain;
  }
  return array;
}

export { itemsPerPage };
