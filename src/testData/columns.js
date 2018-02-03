let uid = 1;

const randomString = () => Math.random().toString(36).substring(7);
const randomInt = () => Math.ceil(Math.random() * 100);
const randomFloat = () => Math.random() * 10;

export default [
  {
    title: 'ID',
    key: 'id',
    generateCellData() {
      const id = uid;
      uid += 1;
      return id;
    },
  },
  {
    title: 'Col 1',
    key: 'col1',
    generateCellData() {
      return randomString();
    },
  },
  {
    title: 'Col 2',
    key: 'col2',
    generateCellData() {
      return randomInt();
    },
  },
  {
    title: 'Col 3',
    key: 'col3',
    generateCellData() {
      return randomFloat();
    },
  },
];
