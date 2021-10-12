<template>
  <div class="ndg-shift" :class="[`ndg-shift-${orientation}`]" :style="[layer,ratio]"
       @dragenter="intentToDragEnter($event)"
       @dragleave="intentDiscardDrag($event)">
  </div>
</template>
<script>
export default {
  name: "shift-zone",
  data() {
    return {
      intentToSwitch: {}
    };
  },
  computed: {
    // 占比
    ratio() {
      if (this.orientation == "right" || this.orientation == "left") {
        return {"min-width": `${this.size}%`};
      } else if (this.orientation == "top" || this.orientation == "bottom") {
        return {"min-height": `${this.size}%`};
      }
      return {};
    },
    layer() {
      return {"z-index": this.flowOver ? this.upperLayer : this.belowLayer};
    }
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
    },
    size: {
      type: Number,
      default: 10
    },
    delaySwitchTime: {
      type: Number,
      default: 250
    }
  },
  methods: {
    intentToDragEnter($event) {
      console.log("拖入，准备切换", this.orientation);
      let shiftDOM = $event.target;
      let colorStart = "rgb(146 148 248 / 10%)";
      let colorEnd = "rgb(255 255 255 / 50%)";
      shiftDOM.style.backgroundImage = `linear-gradient(to ${this.orientation}, ${colorStart}, ${colorEnd})`;
      // 切换桌面
      this.intentToSwitch = setTimeout(() => {
        let offset = 0;
        if (this.orientation == "right") {
          offset = 1;
        } else if (this.orientation == "left") {
          offset = -1;
        }
        this.$emit("switchUnit", offset);
      }, this.delaySwitchTime);
    },
    intentDiscardDrag($event) {
      let shiftDOM = $event.target;
      shiftDOM.style.backgroundImage = "";
      clearTimeout(this.intentToSwitch);
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
  display: inline;
}

.ndg-shift-top {
  position: fixed;
  top: 0%;
  /* min-height: 3rem; */
  width: 100%;
}

.ndg-shift-bottom {
  position: fixed;
  bottom: 0%;
  /* min-height: 3rem; */
  width: 100%;
}

.ndg-shift-left {
  position: absolute;
  left: 0%;
  /* min-width: 10%; */
  height: 100%;
  overflow-y: auto;
}

.ndg-shift-right {
  position: absolute;
  right: 0%;
  /* min-width: 10%; */
  height: 100%;
  overflow-y: auto;
}
</style>
