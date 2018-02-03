<template>
  <div class="recycling-virtual-scroller" @scroll.passive="onScroll">
    <div class="items-container" :style="containerStyle">
      <div class="item-view" v-for="vm in viewModels" :key="vm.id" :style="{ top: vm.top+'px', display: vm.display }">
        <component :is="vm.component" :item="vm.data" :item-index="vm.index"></component>
      </div>
    </div>
  </div>
</template>

<script>
import oncePerFrame from '@/utils/oncePerFrame';
import debounce from '@/utils/debounce';

function validateItem(item) {
  return false;
}
function validateItems(items) {
  return items.some(validateItem)
}

class VmEntry {
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
      }
    });
  }
}
function findUnusedVm(component) {
  return function findFunc(entry) {
    return entry.component === component && !entry.inUse;
  }
}
function releaseVmEntry(vmEntry) {
  vmEntry.release();
}
function inUse(vmEntry) {
  return vmEntry.inUse
}
function createVmPool() {
  let vmPool = [];
  let uid = 1;
  const context = {
    getAvailableVm({component, index, data, top}) {
      let entry = vmPool.find(findUnusedVm(component));
      if (!entry) {
        entry = new VmEntry({
          id: uid++,
          index,
          data,
          component,
          top,
        });
        vmPool.push(entry);
      } else {
        entry.inUse = true;
        entry.index = index;
        entry.display = 'block';
        entry.data = data;
        entry.top = top;
      }
      return entry;
    },
    findVm(func) {
      return vmPool.find(func);
    },
    findByIndex(index) {
      return vmPool.find(function findIndex(vm) {
        return vm.index === index;
      })
    },
    releaseWhere(func) {
      vmPool.filter(func).forEach(releaseVmEntry);
    },
    releaseAll() {
      vmPool.forEach(releaseVmEntry);
    },
    removeUnused() {
      vmPool = vmPool.filter(inUse);
      return vmPool;
    },
    getPool() {
      return vmPool;
    },
    // todo: remove after development
    print() {
      console.log(vmPool);
    },
  };
  return context;
}

export default {
  props: {
    itemHeight: {
      required: false,
      type: Number,
      default: 30, // todo: change back to null when done developing
    },
    items: {
      required: true,
      type: Array,
      validateItems
    },
    buffer: {
      required: false,
      type: Number,
      default: 100,
      validator(buffer) {
        return buffer > 0;
      }
    }
  },
  data() {
    return {
      viewModels: [],
      totalHeight: 1000,
      activeRaf: false,
    }
  },
  computed: {
    containerStyle() {
      return {
        height: this.totalHeight+'px',
      }
    },
    fixedHeightMode() {
      return this.itemHeight !== null
    },
    heights() {
      return [];
    },
  },
  created() {
    // create a viewModel pool
    this.vmPool = createVmPool();
    this.viewModels = this.vmPool.getPool();

    // create a oncePerFrame throttle for update functions
    this.updateVisibleItems = oncePerFrame(this.updateVisibleItems);

    // create debounce functions
    this.cleanPool = debounce(this.cleanPool, { delay: 1000 });

    // create non-reactive data
    this.lastUpdate = {
      startIndex: 0,
      endIndex: 0,
      continuous: true,
    };
  },
  mounted() {
    this.updateVisibleItems();
  },
  beforeUpdate() {
    window.console.time('update');
  },
  updated() {
    window.console.timeEnd('update');
  },
  methods: {
    onScroll(e) {
      console.log(e);
      this.updateVisibleItems();
      this.cleanPool();
    },
    updateVisibleItems() {
      console.time('#updateVisibleItems');
      const { items, vmPool, itemHeight } = this;
      const { startIndex, endIndex, totalHeight } = this.fixedHeightMode
        ? this.getFixedHeightData()
        : this.getVariableHeightData();

      // release out of range view models
      vmPool.releaseWhere(function filterFunc(vm){
        return vm.index < startIndex || vm.index > endIndex;
      });

      // ensure that each visible item has a vm
      for (var index = startIndex; index < endIndex; index++) {
        const item = items[index];
        let vm = vmPool.findByIndex(index);
        if (!vm) {
          // todo: account for variable height mode
          const top = index * itemHeight;
          vm = vmPool.getAvailableVm({
            component: item.component,
            data: item.data,
            index,
            top,
          });
        }
      }

      // update component
      this.totalHeight = totalHeight;
      this.lastUpdate.startIndex = startIndex;
      this.lastUpdate.endIndex = endIndex;

      console.timeEnd('#updateVisibleItems');
    },
    cleanPool() {
      console.time('#cleanPool')
      // todo: would modifying the pool in place be faster?
      this.vmPool.print();
      this.viewModels = this.vmPool.removeUnused();
      this.vmPool.print();
      console.timeEnd('#cleanPool')
    },
    getBounds() {
      const { scrollTop, offsetHeight } = this.$el;
      return {
        top: scrollTop,
        bottom: scrollTop + offsetHeight,
      };
    },
    getFixedHeightData() {
      const buffer = this.buffer;
      const bounds = this.getBounds();
      const topBoundary = bounds.top - buffer;
      const bottomBoundary = bounds.bottom + buffer;
      const items = this.items;
      const length = items.length;
      const itemHeight = this.itemHeight;
      const startIndex = Math.floor(topBoundary / itemHeight);
      const endIndex = Math.ceil(bottomBoundary / itemHeight);
      return {
        startIndex: startIndex < 0 ? 0 : startIndex,
        endIndex: endIndex > length ? length : endIndex,
        totalHeight: items.length * itemHeight,
      };
    },
    getVariableHeightData() {
      throw new Error("todo: #getVariableHeightData");
    },
  },
};
</script>

<style scoped>
.recycling-virtual-scroller {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
}
.items-container {
  top: 0;
}
.item-view {
  position: absolute;
  left: 0;
  right: 0;
  overflow: hidden;
}
</style>
