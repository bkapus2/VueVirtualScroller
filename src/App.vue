<template>
  <div id="app">
    <div class="header"></div>
    <virtual-scroll
      v-bind:items="items">
      <template slot-scope="{ item, index, component }">
        <component :is="component"
          :row-data="item"
          :row-index="index">
        </component>
      </template>
    </virtual-scroll>
  </div>
</template>

<script>
// import VirtualScroll from './components/VirtualScroll';
import VirtualScroll from './components/RecyclingVirtualScroller';
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
  }),
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
.header {
  
}
</style>
