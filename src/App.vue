<template>
  <div id="app">
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
      <div class="footer" slot="footer"></div>
    </virtual-scroll>
  </div>
</template>

<script>
import VirtualScroll from './components/VirtualScroll';
import DataItem from './components/DataItem';
import OtherDataItem from './components/OtherDataItem';
import rows from './testData/rows';
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
    VirtualScroll,
  },
  data: () => ({
    items,
    showHeader: true,
  }),
  created() {
    // setTimeout(()=>{this.showHeader=!this.showHeader}, 1000)
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
  width: 800px;
  height: 600px;
  margin: 60px auto auto;
  border: 1px solid black;
}
.head {
  z-index: 2;
  height: 45px;
  background-color: white;
  border-bottom: 1px solid gray;
  display: flex;
  justify-content: space-around;
}
.footer {
  z-index: 2;
  height: 17px;
  background-color: white;
  border-top: 1px solid gray;
  display: flex;
  justify-content: space-around;
}
</style>
