<template>
  <div class="recycling-virtual-scroller" @scroll.passive="onScroll">
    <div class="items-container" :style="containerStyle">
      <div class="item-wrapper">
        <div class="item-view" v-for="view in viewPool" :key="view.id">
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

function findUnusedOfType(type) {
  return function findFunc(entry) {
    return entry.type === type && entry.used === false;
  }
}
function getComponentInstancePool() {
  const pool = [];
  let uid = 1;
  return {
    getInstance({type, index, data}) {
      let entry = pool.find(findUnusedOfType(type));
      if (!entry) {
        entry = {
          id: uid++,
          top: 0,
          index,
          data,
          used: true
        }
      } else {
        Object.assign(entry, {
          index,
          data,
          used: true
        });
      }
      return entry;
    },
    releaseInstance(entry) {
      Object.assign(entry, {
        top: 0,
        index: null,
        data: null,
        used: false,
      });
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
      viewPool: [],
      totalHeight: 1000
    }
  },
  computed: {
    containerStyle() {
      console.log('updating container style')
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
    this.onScroll = oncePerFrame(this.onScroll);
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
      console.log(new Date().valueOf())
      this.updateVisibleItems();
    },
    updateVisibleItems() {
      const { startIndex, endIndex, totalHeight } = this.fixedHeightMode
        ? this.getFixedHeightData()
        : this.getVariableHeightData();
      console.log({ startIndex, endIndex, totalHeight })

      this.totalHeight = totalHeight;
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
