class RowModel {
  constructor({ id, index, data, component, top }) {
    this.top = top;
    this.display = 'block';
    this.index = index;
    this.data = data;
    Object.defineProperties(this, {
      id: {
        value: id,
        configurable: false,
        writable: false,
      },
      inUse: {
        value: true,
        configurable: false,
        writable: true,
      },
      release: {
        value: function release() {
          this.inUse = false;
          this.display = 'none';
        },
        configurable: false,
        writable: false,
      },
      component: {
        value: component,
        configurable: false,
        writable: false,
      },
    });
  }
}

function findUnusedRowModel(component) {
  return function findFunc(rowModel) {
    return rowModel.component === component && !rowModel.inUse;
  };
}

function releaseRowModel(rowModel) {
  rowModel.release();
}

function inUse(rowModel) {
  return rowModel.inUse;
}

function createRowModelPool() {
  let rowModelPool = [];
  let uid = 1;
  const context = {
    getAvailableRowModel({ component, index, data, top }) {
      let rowModel = rowModelPool.find(findUnusedRowModel(component));
      if (!rowModel) {
        rowModel = new RowModel({
          id: uid++,
          index,
          data,
          component,
          top,
        });
        rowModelPool.push(rowModel);
      } else {
        rowModel.inUse = true;
        rowModel.index = index;
        rowModel.display = 'block';
        rowModel.data = data;
        rowModel.top = top;
      }
      return rowModel;
    },
    findRowModel(func) {
      return rowModelPool.find(func);
    },
    findByIndex(index) {
      return rowModelPool.find((rowModel) => rowModel.index === index);
    },
    releaseWhere(func) {
      rowModelPool.filter(func).forEach(releaseRowModel);
    },
    releaseAll() {
      rowModelPool.forEach(releaseRowModel);
    },
    removeUnused() {
      rowModelPool = rowModelPool.filter(inUse);
      return rowModelPool;
    },
    getPool() {
      return rowModelPool;
    },
    // todo: remove after development
    print() {
      window.console.log(rowModelPool);
    },
  };
  return context;
}

export default createRowModelPool;
