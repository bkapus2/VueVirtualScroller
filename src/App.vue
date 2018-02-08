<template>
  <div id="app">
    <component-display name="Virtual Scroll" width="800" height="600">
      <virtual-scroll
        v-bind:items="items">
        <div v-if="showHeader" class="head" slot="header">
          <span>HEADER</span>
        </div>
        <template slot-scope="{ item, index, component }">
          <component :is="component"
            :row-data="item"
            :row-index="index">
          </component>
        </template>
        <div class="foot" slot="footer"></div>
      </virtual-scroll>
    </component-display>
    <!-- <component-display name="Data Grid" width="800" height="600">
      <data-grid></data-grid>
    </component-display> -->
    <component-display name="Header Component" width="800">
      <div>TODO</div>
    </component-display>
    <component-display name="Row Component" width="800" height="30">
      <data-row :row="items[0].data" :columns="columns"></data-row>
    </component-display>
    <component-display name="Footer Component" width="800">
      <div>TODO</div>
    </component-display>
  </div>
</template>

<script>
import VirtualScroll from '@/components/VirtualScroll';
import DataItem from '@/components/DataItem';
import OtherDataItem from '@/components/OtherDataItem';
import ComponentDisplay from '@/components/ComponentDisplay';
import DataRow from '@/components/DataRow';
import DataGrid from '@/components/DataGrid';

import rows from '@/testData/rows';
import columns from '@/testData/columns';
const items = rows.map(function mapRow(item, index) {
  return {
    component: index % 10 === 0 ? OtherDataItem : DataItem,
    index,
    data: item,
  }
});


export default {
  name: 'App',
  components: {
    DataGrid,
    ComponentDisplay,
    DataRow,
    VirtualScroll,
  },
  data: () => ({
    columns,
    items,
    showHeader: false,
  }),
  created() {
    setTimeout(()=>{this.showHeader=!this.showHeader}, 1000)
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 60px auto auto;
}
.head {
  z-index: 2;
  height: 45px;
  background-color: white;
  border-bottom: 1px solid gray;
  display: flex;
  justify-content: space-around;
}
.foot {
  z-index: 2;
  height: 17px;
  background-color: white;
  border-top: 1px solid gray;
  display: flex;
  justify-content: space-around;
}
</style>
