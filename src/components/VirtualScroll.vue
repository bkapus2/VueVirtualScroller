<template>
  <div
    class="virtual-scroller"
    v-on:scroll="onScroll">
    <div
      v-on-mounted="onBeforeContentMounted"
      ref="beforeContent"
      class="before-content">
      <slot name="before-content"></slot>
    </div>
    <component
      ref="container"
      class="container"
      v-bind:is="itemsComponent || itemsTag"
      v-bind:style="containerStyle">
      <component
        v-on-mounted="updateItemHeight(itemIndex)"
        v-on-updated="updateItemHeight(itemIndex)"
        v-bind:is="itemComponent || itemTag"
        v-for="itemIndex in renderedItemIndexes"
        v-bind:key="itemIndex"
        v-bind:item="items[itemIndex]"
        v-bind:item-index="itemIndex">
        <td>
          {{ itemIndex }}
        </td>
        <td
          v-for="(itemProperty, itemPropertyIndex) in itemProperties"
          v-bind:key="itemPropertyIndex">
          {{ items[itemIndex][itemProperty] }}
        </td>
      </component>
    </component>
    <div
      v-on-mounted="onAfterContentMounted"
      ref="afterContent"
      class="after-content">
      <slot name="after-content"></slot>
    </div>
    <div 
      class="background"
      ref="background"
      v-bind:style="backgroundStyle">
    </div>
  </div>
</template>

<script>
const onMounted = {
  inserted(el, binding) {
    binding.value(el);
  }
}
const onUpdated = {
  updated(el, binding) {
    binding.value(el);
  }
}

export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    itemsTag: {
      type: String,
      required: false,
      default: "table"
    },
    itemTag: {
      type: String,
      required: false,
      default: "tr"
    },
    itemsComponent: {
      type: Object,
      required: false,
    },
    itemComponent: {
      type: Object,
      required: false,
    },
  },
  directives: {
    onMounted,
    onUpdated,
  },
  data() {
    return {
      // todo: will updating scrollTop affect something that depends on height?
      virtualScroller: {
        height: 0,
        scrollTop: 0,
      },
      beforeContent: {
        height: 0,
      },
      afterContent: {
        height: 0,
      },
      itemHeights: Array(this.items.length).fill(24),
      renderFromIndex: 0,
      renderToIndex: 10,
      containerMarginTop: 0,
    }
  },
  computed: {
    itemProperties() {
      const { items } = this;
      if (items.length) {
        return Object.keys(items[0]);
      } else {
        return [];
      }
    },
    containerStyle() {
      const { containerMarginTop, afterContent } = this;
      return {
        marginTop: containerMarginTop + 'px',
        marginBottom: afterContent.height + 'px',
      }
    },
    availableHeight() {
      const { virtualScroller, beforeContent, afterContent } = this;
      return virtualScroller.height - beforeContent.height - afterContent.height;
    },
    backgroundStyle() {
      const { itemHeights, beforeContent, afterContent } = this;
      let sumItemHeights = 0;
      for (var itemHeight of itemHeights) {
        sumItemHeights += itemHeight;
      }
      return {
        height: ( sumItemHeights + beforeContent.height + afterContent.height ) + 'px',
      }
    },
    renderedItemIndexes() {
      const renderedItemIndexes = [];
      const { renderFromIndex, renderToIndex } = this;
      let index = renderFromIndex;
      while(index <= renderToIndex) {
        renderedItemIndexes.push(index);
        index++;
      }
      return renderedItemIndexes;
    }
  },
  mounted() {
    this.initializeHeights();
    this.updateRenderedItems();
  },
  methods: {
    onScroll() {
      const { scrollTop } = this.$el;
      this.virtualScroller.scrollTop = scrollTop;
      this.syncPoitionUpdate();
      this.updateRenderedItems();
    },
    syncPoitionUpdate() {
      // todo: should I use request animation frame?
      const { scrollTop } = this.$el;
      this.$refs.beforeContent.style.top = scrollTop + 'px';
      this.$refs.afterContent.style.bottom = (-scrollTop) + 'px';
    },
    initializeHeights() {
      const { offsetHeight } = this.$el;
      this.virtualScroller.height = offsetHeight;
      this.beforeContent.height = this.$refs.beforeContent.offsetHeight;
      this.afterContent.height = this.$refs.afterContent.offsetHeight;
    },
    onBeforeContentMounted(...args) {
      console.log(...args);
    },
    onAfterContentMounted(...args) {
      console.log(...args);
    },
    updateItemHeight(itemIndex) {
      return el => {
        const itemHeights = this.itemHeights.slice(0);
        itemHeights.splice(itemIndex, 1, el.offsetHeight)
        this.itemHeights = itemHeights;
      }
    },
    updateRenderedItems() {
      // todo: put this behind a debounce
      const { scrollTop } = this.$el;
      const { itemHeights, virtualScroller, beforeContent, afterContent } = this;
      const renderFromHeight = scrollTop + beforeContent.height;
      const renderToHeight = virtualScroller.height + scrollTop
        - beforeContent.height - afterContent.height;
      const itemsLen = this.items.length;
      const itemBuffer = 2;
      let index = 0;
      let heightAccumulator = 0;
      let renderFromIndex = null;
      let renderToIndex = null;
      let containerMarginTop = 0;
      while(index < itemsLen) {
        if (heightAccumulator >= scrollTop && renderFromIndex === null) {
          renderFromIndex = index - itemBuffer;
          if (renderFromIndex < 0) {
            renderFromIndex = 0;
          }
          const bufferHeight = itemHeights.slice(renderFromIndex, index).reduce((a,v)=>a+v, 0);
          console.log(renderFromIndex, index);
          containerMarginTop = heightAccumulator + beforeContent.height - bufferHeight; // todo: adjust for buffer
        }
        heightAccumulator+=itemHeights[index];
        if (heightAccumulator >= renderToHeight && renderToIndex === null) {
          renderToIndex = index + itemBuffer;
          if (renderToIndex >= itemsLen -1) {
            renderToIndex = itemsLen -1;
          }
          break;
        }
        index++;
      }
      this.renderFromIndex = renderFromIndex;
      this.renderToIndex = renderToIndex;
      this.containerMarginTop = containerMarginTop;
    }
  },
  watch: {
    items(items) {
      this.itemsHeights = Array(items.length).fill(24);
    }
  }
}
</script>

<style scoped>
.virtual-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;
}
.container {
  border-collapse: collapse;
}
.before-content {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}
.after-content {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
}
.background {
  position: absolute;
  width: 100%;
  top: 0px;
}
</style>
