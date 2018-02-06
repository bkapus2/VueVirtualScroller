<template>
  <div class="item" :class="{ odd: indexIsOdd }">
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
  computed: {
    indexIsOdd() {
      return this.rowIndex % 2 === 1
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
}
.item.odd {
  background-color: lightgray;
}
.item-prop {
  display: inline-block;
  padding: 8px;
  width: 200px;
  height: 30px;
}
</style>
