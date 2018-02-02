<template>
  <div class="recycling-virtual-scroller" @scroll.passive="onScroll">
    <div class="items-container" :style="containerStyle">
      <div class="item-wrapper">
        <div class="item-view" v-for="vm in viewModels" :key="vm.id">
          <component :is="item.component" :item="item"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import oncePerFrame from '@/utils/oncePerFrame';

function validateItem(item) {
  return false;
}
function validateItems(items) {
  return items.some(validateItem)
}

class VmEntry {
  constructor({ id, index, data, component }) {
    this.top = 0;
    this.index = index;
    this.data = data;
    Object.defineProperties(this, {
      id: {
        value: uid++,
        configurable: false,
        writable: false,
      },
      inUse: {
        value: true,
        configurable: false,
      },
      release: {
        value: function release() {
          this.inUse = false;
        },
        configurable: false,
        writable: false,
      },
      component: {
        value: component,
        configurable: false,
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
  return {
    getVm({component, index, data}) {
      let entry = vmPool.find(findUnusedVm(component));
      if (!entry) {
        entry = new VmEntry({
          id: uid++,
          index,
          data,
          component,
        });
      }
      return entry;
    },
    releaseWhere(func) {
      vmPool.filter(func).forEach(releaseVmEntry);
    },
    releaseAll() {
      vmPool.forEach(releaseVmEntry);
    },
    removeUnused() {
      vmPool = vmPool.filter(inUse);
    }
  };
}

export default {
  props: {
    itemHeight: {
      required: false,
      type: Number,
      default: 20, // todo: change back to null when done developing
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

    // create a oncePerFrame throttle for update functions
    this.updateVisibleItems = oncePerFrame(this.updateVisibleItems);

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
    onScroll() {
      this.updateVisibleItems();
    },
    updateVisibleItems() {
      const { startIndex, endIndex, totalHeight } = this.fixedHeightMode
        ? this.getFixedHeightData()
        : this.getVariableHeightData();

      // release out of range view models
      this.vmPool.releaseWhere(function filterFunc(vm){
        return vm.index < startIndex || vm.index > endIndex;
      });

      // update component
      this.totalHeight = totalHeight;
      this.lastUpdate.startIndex = startIndex;
      this.lastUpdate.endIndex = endIndex;
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
    }
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
</style>
