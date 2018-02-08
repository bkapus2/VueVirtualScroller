<template>
  <div>
    <div class="title">{{name}}</div>
    <div class="window" :style="displayStyle">
      <div class="display">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      required: true,
      type: String,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    }
  },
  computed: {
    displayStyle() {
      const { width, height } = this;
      const style = {};
      if (width) {
        style.width = width + 'px';
      }
      if (height) {
        style.height = height + 'px';
      }
      return style;
    }
  }
}
</script>

<style>
.title {
  padding: 4px 8px;
  font-weight: bold;
}
.window {
  border: 1px solid darkslategray;
  margin: 10px auto;
  overflow: auto;
  resize: both;
  padding: 10px;
  background-color: lightsteelblue;
}
.display {
  border: 1px dotted darkslategray;
  height: 100%;
  box-sizing: border-box;
  background-color: white;
}
</style>
