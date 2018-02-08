import columns from './columns';

const colReduceFn = (acc, col) => {
  acc[col.key] = col.generateCellData();
  return acc;
};
const createRow = () => columns.reduce(colReduceFn, {});

export default Array(10000).fill().map(createRow);
