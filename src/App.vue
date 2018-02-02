<template>
  <div id="app">
    <virtual-scroll
      v-bind:items="items">
      <div slot="before-content" class="outside-content"></div>
      <div slot="after-content" class="outside-content"></div>
    </virtual-scroll>
  </div>
</template>

<script>
// import VirtualScroll from './components/VirtualScroll';
import VirtualScroll from './components/RecyclingVirtualScroller';
import oncePerFrame from './utils/oncePerFrame';
window.oncePerFrame = oncePerFrame;
const randomString = () => Math.random().toString(36).substring(7);
const randomInt = () => Math.ceil(Math.random()*100);
const randomFloat = () => Math.random()*10;
const items = Array.apply(null, Array(100000)).map(()=>({
  col1: randomString(),
  col2: randomInt(),
  col3: randomFloat(),
  col4: randomFloat(),
  col5: randomFloat(),
  col6: randomFloat(),
}));

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
.outside-content {
  height: 30px;
  background-color: gray;
}
</style>
