<template>
  <div class="data-row" :style="rowStyle">
    <div class="data-cell"
      v-for="(column, columnIndex) in columns"
      :key="columnIndex"
      :style="{ width: (column.width || defaultCellWidth)+'px' }">
      {{ row[column.key] }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    columns: {
      required: true,
      type: Array,
    },
    row: {
      required: true,
      type: Object,
    },
    rowWidth: {
      required: false, //todo: this should be a required value
      type: Number,
    },
    defaultCellWidth: {
      required: false,
      type: Number,
      default: 120,
    },
  },
  computed: {
    rowStyle() {
      const { rowWidth, columns, defaultCellWidth } = this;
      return {
        //todo: this should be a given prop
        width: (rowWidth || columns.length * defaultCellWidth) +'px',
      };
    }
  }
}
</script>

<style>
.data-row {
  
}
.data-cell {
  float: left;
}
</style>
