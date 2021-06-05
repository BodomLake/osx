<template>
  <div class="ndg-shift" :class="[`ndg-shift-${orientation}`]" :style="{'z-index':flowOver? upperLayer: belowLayer }" :draggable="flowOver"
    @dragenter="intentToDragOver($event)" @dragleave="intentDiscardDrag($event)"></div>
</template>
<script>
  import { CONTAINER, OUTER, APP, DELAY, DESKTOP } from "./common.js";
  export default {
    name: "shift-zone",
    data() {
      return {
        intentToSwitch: {}
      };
    },
    props: {
      flowOver: {
        type: Boolean,
        default: false
      },
      orientation: {
        type: String,
        default: "right"
      },
      belowLayer: {
        type: String,
        default: "-1"
      },
      upperLayer: {
        type: String,
        default: "3"
      }
    },
    methods: {
      intentToDragOver($event) {
        console.log("拖入，准备切换桌面", $event.target, this.orientation);
        let shiftDOM = $event.target;
        let colorStart = "rgb(146 148 248 / 10%)";
        let colorEnd = "rgb(255 255 255 / 50%)";
        shiftDOM.style.backgroundImage = `linear-gradient(to ${this.orientation}, ${colorStart}, ${colorEnd})`;
        // 切换桌面
        this.intentToSwitch = setTimeout(() => {
          this.$emit("switchDesktop", this.orientation);
        }, DELAY);
      },
      intentDiscardDrag($event) {
        console.log("撤出，放弃切换桌面", $event.target);
        // 放弃切换桌面，把背景模糊颜色消除
        let shiftDOM = $event.target;
        shiftDOM.style.backgroundImage = "";
        this.intentToSwitch = null;
      }
    }
  };
</script>
<style scoped>
.ndg-shift {
  /* border: 1px solid red; */
  /* 没有进入拖拽状态的时候放在desktop的下面 */
  /* 进入拖拽状态的时候增加z-index到3 */
  z-index: 0;
  position: absolute;
}
.ndg-shift-top {
  position: fixed;
  top: 0%;
  min-height: 3rem;
  width: 100%;
}
.ndg-shift-bottom {
  position: fixed;
  bottom: 0%;
  min-height: 3rem;
  width: 100%;
}
.ndg-shift-left {
  position: fixed;
  left: 0%;
  min-width: 3rem;
  height: 100%;
  overflow-y: auto;
}
.ndg-shift-right {
  position: fixed;
  right: 0%;
  min-width: 3rem;
  height: 100%;
  overflow-y: auto;
}
</style>