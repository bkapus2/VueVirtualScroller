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

class ComponentInstancePool {
  constructor() {
    this.pools = [];
  }
  // getUnusedComponentInstance(component) {
  //   let pool 
  // }
}

export default {
  props: {
    itemHeight: {
      required: false,
      type: Number,
      default: null,
    },
    items: {
      required: true,
      type: Array,
      validateItems
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
  methods: {
    onScroll() {
      console.log(new Date().valueOf())
    }
  }
}
</script>

<style scoped>
.recycling-virtual-scroller {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
}
</style>
