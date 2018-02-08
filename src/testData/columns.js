let uid = 1;

const randomString = () => Math.random().toString(36).substring(7);
const randomInt = () => Math.ceil(Math.random() * 100);
const randomFloat = () => Math.random() * 10;

const rngFuncs = [randomString, randomInt, randomFloat];
const getRngFunc = () => rngFuncs[Math.floor(Math.random(3))];

const title = str => str[0].toUpperCase() + str.slice(1);

const columns = [
  {
    title: 'ID',
    key: 'id',
    generateCellData() {
      const id = uid;
      uid += 1;
      return id;
    },
  },
];
const nRandomColumns = 20;
for (let index = 0; index < nRandomColumns; index++) {
  columns.push({
    title: title(randomString()),
    generateCellData: getRngFunc(),
    key: index,
  });
}

export default columns;
