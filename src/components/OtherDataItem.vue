<template>
  <div class="item">
    <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="item-prop">
      {{ rowData[column.key] }}
    </div>
  </div>
</template>

<script>
import testDataColumns from '@/testData/columns';
export default {
  props: {
    rowData: {
      required: true,
      type: Object
    },
    rowIndex: {
      required: true,
      type: Number,
    }
  },
  data() {
    return {
      columns: testDataColumns,
    }
  }
}
</script>

<style scoped>
.item {
  height: 30px;
  display: flex;
  color: white;
  background-color: black;
}
.item-prop {
  display: inline-block;
  padding: 8px;
  min-width: 100px;
  max-width: 100px;
  text-align: left;
}
</style>
