<template>
  <div class="recycling-virtual-scroller" @scroll.passive="onScroll">
    <div class="items-container" :style="containerStyle">
      <div class="item-view" v-for="rowModel in rowModels" :key="rowModel.id" :style="{ top: rowModel.top+'px', display: rowModel.display }">
        <component :is="rowModel.component" :item="rowModel.data" :item-index="rowModel.index"></component>
      </div>
    </div>
  </div>
</template>

<script>
import rafThrottle from '@/utils/rafThrottle';
import debounce from '@/utils/debounce';
import rowModelPool from '@/utils/rowModelPool';

function validateItem(item) {
  return false;
}
function validateItems(items) {
  return items.some(validateItem)
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
      rowModels: [],
      totalHeight: 1000,
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
    this.rowModelPool = rowModelPool();
    this.rowModels = this.rowModelPool.getPool();

    // create a rafThrottle throttle for update functions
    this.updateVisibleItems = rafThrottle(this.updateVisibleItems);

    // create debounce function
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
      this.updateVisibleItems();
      this.cleanPool();
    },
    updateVisibleItems() {
      console.time('#updateVisibleItems');
      const { items, rowModelPool, itemHeight } = this;
      const { startIndex, endIndex, totalHeight } = this.fixedHeightMode
        ? this.getFixedHeightData()
        : this.getVariableHeightData();

      // release out of range view models
      rowModelPool.releaseWhere(function filterFunc(rowModel){
        return rowModel.index < startIndex || rowModel.index > endIndex;
      });

      // ensure that each visible item has a rowModel
      for (var index = startIndex; index < endIndex; index++) {
        const item = items[index];
        let rowModel = rowModelPool.findByIndex(index);
        if (!rowModel) {
          // todo: account for variable height mode
          const top = index * itemHeight;
          rowModel = rowModelPool.getAvailableRowModel({
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
      this.rowModelPool.print();
      this.rowModels = this.rowModelPool.removeUnused();
      this.rowModelPool.print();
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
