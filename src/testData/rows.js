import columns from './columns';

const rows = [];
let nRows = 10000;
function colReduceFn(acc, col) {
  acc[col.key] = col.generateCellData();
  return acc;
}
while (nRows--) { // eslint-disable-line no-plusplus
  rows.push(columns.reduce(colReduceFn, {}));
}

export default rows;
