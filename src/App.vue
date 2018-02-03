<template>
  <div id="app">
    <div class="header"></div>
    <virtual-scroll
      v-bind:items="items">
    </virtual-scroll>
  </div>
</template>

<script>
// import VirtualScroll from './components/VirtualScroll';
import VirtualScroll from './components/RecyclingVirtualScroller';
import TestDataItem from './components/TestDataItem';
import rows from './testData/rows';
const items = rows.map(function mapRow(item, index) {
  return {
    component: TestDataItem,
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
