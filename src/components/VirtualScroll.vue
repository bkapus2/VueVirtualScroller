<template>
  <div class="recycling-virtual-scroller" @scroll.passive="onScroll">
    <div class="header"
      ref="header"
      v-if="$slots.header"
      v-on-inserted="onHeaderInserted"
      v-on-resize="onHeaderResize"
      v-sticky-position.top>
      <slot name="header"></slot>
    </div>
    <div class="items-container" :style="containerStyle">
      <div class="item-view" 
        v-for="rowModel in rowModels" :key="rowModel.id" 
        :style="rowModel.style">
        <slot 
          :item="rowModel.data" 
          :index="rowModel.index"
          :component="rowModel.component">
        </slot>
      </div>
    </div>
    <div class="footer"
      ref="footer"
      v-if="$slots.footer"
      v-on-inserted="onFooterInserted"
      v-on-resize="onFooterResize"
      v-sticky-position.bottom>
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import rafThrottle from '@/utils/rafThrottle';
import debounce from '@/utils/debounce';
import rowModelPool from '@/utils/rowModelPool';

import stickyPosition from '@/directives/stickyPosition';

const onResize = {
  inserted(el, binding) {
    let height = el.offsetHeight;
    let width = el.offsetWidth;
    const { value } = binding;
    // todo: find a better way to store this
    binding.observer = new MutationObserver(mutations => {
      const newHeight = el.offsetHeight;
      const newWidth = el.offsetWidth;
      const heightChange = newHeight !== height;
      const widthChange = newWidth !== width;
      if (heightChange || widthChange) {
        vlaue({
          oldHeight: height,
          oldWidth: width,
          newHeight,
          newWidth,
          heightChange,
          widthChange,
        });
        height = newHeight;
        width = newWidth;
      }
    });
    binding.observer.observe(el, { attributes: true, characterData: true });
  },
  unbind(el, binding) {
    binding.observer.disconnect();
  }
}

const onInserted = {
  inserted(el, binding) {
    const { value } = binding;
    value();
  },
  unbind(el, binding) {
    const { modifiers, value } = binding;
    const { andOnRemove=false } = modifiers;
    if(andOnRemove) {
      value();
    }
  }
}

function validateItem(item) {
  return false;
}
function validateItems(items) {
  return items.some(validateItem)
}

export default {
  directives: {
    onResize,
    onInserted,
    stickyPosition,
  },
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
      default: 300,
      validator(buffer) {
        return buffer > 0;
      }
    }
  },
  data() {
    return {
      rowModels: [],
      totalHeight: 1000,
      topOffset: 0,
      bottomOffset: 0,
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
      const { items, rowModelPool, itemHeight, topOffset } = this;
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
        // todo: account for variable height mode
        const top = index * itemHeight + topOffset;
        if (!rowModel) {
          rowModel = rowModelPool.getAvailableRowModel({
            component: item.component,
            height: itemHeight,
            data: item.data,
            index,
            top,
          });
        } else {
          rowModel.top = top;
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
      const { topOffset, bottomOffset } = this;
      return {
        top: scrollTop + topOffset,
        bottom: scrollTop + topOffset + offsetHeight + bottomOffset,
      };
    },
    getFixedHeightData() {
      const { topOffset, bottomOffset } = this;
      const buffer = this.buffer;
      const bounds = this.getBounds();
      const topBoundary = bounds.top - buffer; // todo: account for beforeContent
      const bottomBoundary = bounds.bottom + buffer; // todo: account for afterContent
      const items = this.items;
      const length = items.length;
      const itemHeight = this.itemHeight;
      const startIndex = Math.floor(topBoundary / itemHeight);
      const endIndex = Math.ceil(bottomBoundary / itemHeight);
      return {
        startIndex: startIndex < 0 ? 0 : startIndex,
        endIndex: endIndex > length ? length : endIndex,
        totalHeight: topOffset + items.length * itemHeight + bottomOffset,
      };
    },
    getVariableHeightData() {
      throw new Error("todo: #getVariableHeightData");
    },
    onHeaderInserted() {
      this.topOffset = this.$refs.header.offsetHeight;
      this.updateVisibleItems();
    },
    onFooterInserted() {
      this.bottomOffset = this.$refs.footer.offsetHeight;
      this.updateVisibleItems();
    },
    onHeaderResize({ heightChange, newHeight }) {
      console.log(heightChange)
      if (heightChange) {
        this.topOffset = newHeight;
        this.updateVisibleItems();
      }
    },
    onFooterResize({ heightChange, newHeight }) {
      if (heightChange) {
        this.bottomOffset = newHeight;
        this.updateVisibleItems();
      }
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
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.item-view {
  position: absolute;
  left: 0;
  right: 0;
  overflow: hidden;
}
.header, .footer {
  width: 100%;
  z-index: 2;
  box-sizing: border-box;
}
</style>
