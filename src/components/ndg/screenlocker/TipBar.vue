<template>
  <div class="tipbar" draggable="true" @dragstart="dragStart($event)" @dragend="dragEnd($event)">
    <!-- 主版面-->
    <div class="main-panel" ref="panel">
      <div class="app-icon">
        <div style="position: relative;height: 100%">
          <my-icon :class-name="tip.app"></my-icon>
        </div>
      </div>
      <div class="bar">
        <div class="bar1">
          <div>
            <span>{{ tip.name }}</span>
          </div>
          <div>
            <span>{{ tip.time }}</span>
          </div>
        </div>
        <div class="bar2">
          <div>{{ tip.title }}</div>
        </div>
        <div class="bar3">
          <div>{{ tip.subTitle }}</div>
        </div>
      </div>


    </div>
    <!-- 左侧抽屉-->
    <div class="left-draw">
      <slot name="left-draw"></slot>
    </div>
    <!-- 右侧抽屉 -->
    <div class="right-draw">
      <slot name="right-draw"></slot>
    </div>
  </div>
</template>

<script>
import MyIcon from "@/components/ndg/MyIcon";

export default {
  name: "TipBar",
  components: {MyIcon},
  data() {
    return {}
  },
  props: {
    tip: {
      required: true,
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  methods: {
    dragStart($event) {
      // $event.preventDefault();
      $event.dataTransfer.effectAllowed = "none";
      console.log('startDrag', $event,)
    },
    dragEnd($event) {
      console.log('dragEnd', $event,)
    }
  }

}
</script>

<style scoped>
.tipbar {
  color: black;
  height: 90%;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 15px 15px 15px 15px;
  user-select: none;
  position: relative;
  top: 50%;
  transform: translate(0%, -50%);
}

.tipbar :hover {
  cursor: url("/static/cursor/link.cur"), auto;
}

.main-panel {
  position: absolute;
  display: flex;
  flex-direction: row;
  height: 100%;
  z-index: 1;
  width: 100%;
  text-align: left;
  pointer-events: none;
}

.app-icon {
  width: 20%;
}

.bar {
  width: 80%;
}

.bar1 {
  display: flex;
  height: 30%;
  font-size: 12px;
}

.bar1 > div {
  height: 100%;
  vertical-align: bottom;
}

.bar1 > div:nth-child(1) {
  width: 85%;
}

.bar1 > div:nth-child(2) {
  width: 15%;
}

.bar2 {
  height: 38%;
  font-size: 16px;
  font-weight: 600;
}

.bar3 {
  height: 32%;
}

</style>
<style scoped>

.left-draw {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
}

.right-draw {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1
}
</style>
