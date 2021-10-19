<template>
  <div id="app" class="hor-vet-center" @mousemove="globalMouseMove($event)">
    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>
// 引入图标库
import "./assets/iconfont.js";

export default {
  name: "App",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      timer: undefined,
    };
  },
  methods: {
    globalMouseMove($event) {
      // 防抖 100ms 延时执行
      if (this.timer) {
        return;
      }
      let mouseInfo = {
        screenX: $event.screenX, screenY: $event.screenY,
        pageX: $event.pageX, pageY: $event.pageY,
        offsetX: $event.offsetX, offsetY: $event.offsetY,
        target: $event.target
      }
      this.timer = window.setTimeout(() => {
        this.$store.commit('setMousePos', mouseInfo)
        this.timer = null;
      }, 1000)
    }
  },
};
</script>

<style>
html {

}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0;
  margin: 0;
  /* height: 100vh; */
  position: fixed;
  width: 100vw;
  height: 100vh;
}

.hor-vet-center {
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
}

/*滚动条整体样式*/
body::-webkit-scrollbar {
  width: 0px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 5px;
}

body::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  background-color: skyblue;
  background-image: -webkit-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
}

body::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ededed;
  border-radius: 10px;
}
</style>
