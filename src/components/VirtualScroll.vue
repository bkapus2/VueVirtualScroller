<template>
  <div class="virtual-scroller">
    <slot 
      ref="before-content"
      name="before-content">
    </slot>
    <component
      ref="container"
      class="container"
      v-bind:is="itemsComponent || itemsTag">
      <component
        v-bind:is="itemComponent || itemTag"
        v-for="(item, itemIndex) in items"
        v-bind:key="itemIndex"
        v-bind:item="item"
        v-bind:item-index="itemIndex">
        <td
          v-for="(itemProperty, itemPropertyIndex) in itemProperties"
          v-bind:key="itemPropertyIndex">
          {{ item[itemProperty] }}
        </td>
      </component>
    </component>
    <slot 
      ref="after-content"
      name="after-content">
    </slot>
    <div>
    </div>
  </div>
</template>

<script>
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
  data() {
    return {
      totalHeight: 0,
      scrollTop: 0,
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
    }
  },
  mounted() {
    this.updateTotalHeight();
  },
  methods: {
    onResize() {

    },
    onScroll() {

    },
    updateTotalHeight() {
      const { offsetHeight } = this.$el;
      this.totalHeight = offsetHeight;
    },
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
</style>
