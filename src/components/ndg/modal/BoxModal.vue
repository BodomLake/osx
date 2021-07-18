<template>
  <div class="ndg-modal hor-vet-center" v-show="box.showModal">
    <div class="ndg-modal-left"></div>
    <div class="ndg-modal-center">
      <!-- app集合的描述 -->
      <div class="ndg-modal-header">
        <div class="ndg-modal-desc" @click="keepModal">
          {{ box.name }}
          <my-icon className="delete" v-show="enableDrag"></my-icon>
        </div>
      </div>
      <!-- app集合的内容，加一个初始化的位置，然后移动到屏幕的中央 -->
      <div class="ndg-modal-content-border-locator" @click="keepModal" style="visibility: hidden" ref="main">
        `<!---->
      </div>
      <!-- 底部区域 -->
      <div class="ndg-modal-footer">
      </div>
    </div>
    <div class="ndg-modal-right"></div>
    <div class="ndg-modal-content-border" :style="[initRect,destRect]" @click="keepModal">
      <ShiftZone orientation="left" :flowOver="isDragging" @switchUnit="switchUnit"
                 :delaySwitchTime="400"></ShiftZone>
      <div class="ndg-modal-content">
        <Box v-model="box" :enableDrag="enableDrag" :multipleSize="30" :showAppName='true'></Box>
      </div>
      <ShiftZone orientation="right" :flowOver="isDragging" @switchUnit="switchUnit"
                 :delaySwitchTime="400"></ShiftZone>
      <Indicator v-model="box"></Indicator>
    </div>
  </div>
</template>

<script>
import MyIcon from "../MyIcon.vue";
import Box from "../Box.vue";
import Indicator from "./Indicator.vue";
import ShiftZone from "../ShiftZone.vue";

export default {
  name: "box-modal",
  components: {
    Indicator: Indicator,
    MyIcon: MyIcon,
    Box: Box,
    ShiftZone: ShiftZone
  },
  beforeCreate() {
  },
  props: {
    box: {
      type: Object,
      default: () => {
        return {
          id: "",
          name: "",
          appGroups: [
            [
              {
                name: "",
                id: ""
              }
            ]
          ],
          displayNo: 0,
          groupAppLimit: 9,
          showModal: false,
          DOMRect: {
            width: 0,
            height: 0
          },
        };
      }
    },
    name: {
      type: String,
      default: () => {
        return "";
      }
    },
    debounceTime: {
      type: Number,
      default: 200
    },
    enableDrag: {
      type: Boolean,
      default: false
    },
  },
  model: {
    prop: "box",
    event: "changeBox"
  },
  watch: {
    // 判断是否显示
    "box.showModal": {
      handler: function (newFlag, oldFlag) {
        if (newFlag == true) {
          // debugger;
          // 处理距离
          let modalRect = document.querySelector(".ndg-modal-content-border-locator").getBoundingClientRect();
          console.log(modalRect)
          this.destPos = modalRect;
        }
      },
      deep: false,
      immediate: true
    }
  },
  data() {
    return {
      editable: true,
      isDragging: true,
      // 生命周期防抖器
      updatedTimer: 0,
      destPos: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      }
    };
  },

  computed: {
    initRect() {
      return {
        "--initWidth": this.box.DOMRect? this.box.DOMRect.width + 'px' : '0px',
        "--initHeight": this.box.DOMRect? this.box.DOMRect.width + 'px' : + '0px',
        "--initX": this.box.DOMRect? this.box.DOMRect.x + 'px' : + '0px',
        "--initY": this.box.DOMRect? this.box.DOMRect.y + 'px' : + '0px',
      }
    },
    destRect() {
      // return {
      //   "--destWidth": this.destPos.width + 'px',
      //   "--destHeight": this.destPos.height + 'px',
      //   "--destX": this.destPos.left + 'px',
      //   "--destY": this.destPos.top + 'px',
      // }
      return {
        "--destWidth": 432 + 'px',
        "--destHeight": 432 + 'px',
        "--destX": 361 + 'px',
        "--destY": 144 + 'px',
      }
    }
  },
  mounted() {
    // modal所占据的矩形区域
  },
  updated() {
    // 防抖 200ms
    let debounceTime = this.debounceTime;
    if (!this.box.showModal) {
      return;
    }
    if (Date.now() - this.updatedTimer < debounceTime) {
      // 重置为当前时间
      console.log(this.box.showModal);
      this.updatedTimer = Date.now();
      return;
    }
    this.updatedTimer = setTimeout(() => {
      // 重置所有
      let modalSpace = document
        .querySelector(".ndg-modal-content-border")
        .getBoundingClientRect();
      // console.log(modalSpace);
      this.$set(this.box, "modalSpace", modalSpace);
      1
      // console.log("定位Modal完成, 不重置悬停状态");
    }, debounceTime);
  },
  methods: {
    keepModal($event) {
      // console.log($event);
      // 防止点击模态框的时候响应 window全局click关闭模态框
      $event.stopPropagation();
    },
    scrollToAppGroup(ui) {
      // console.log("scrollToAppGroup", ui);
      this.box.displayNo = ui;
    },
    switchUnit(orientation) {
      let len = this.box.appGroups.length;
      if (orientation == "right" && this.box.displayNo < len - 1) {
        this.box.displayNo++;
      } else if (orientation == "left" && this.box.displayNo > 0) {
        this.box.displayNo--;
      }
    }
  }
};
</script>
<!-- 模态框css样式 -->
<style scoped>
* {
  --duration-time: 0.5s
}
.ndg-modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
}

.ndg-modal::before {
  content: "";
  position: fixed;
  right: 0;
  bottom: 0;
  /* border-radius: 5%; */
  filter: blur(5px);
  z-index: 1;
  height: 100%;
  width: 100%;
  /* background-color: rgba(255, 255, 255, 0.5); */
}

.ndg-modal-center {
  display: flex;
  flex-direction: column;
  /* 以下css属性都要被动态class重置 */
  /* position: fixed; */
  height: 100vmin;
  max-width: 60vmax;
  min-width: 60vmax;
  z-index: 10;
}

.ndg-modal-header {
  flex-grow: 1;
  position: relative;
  max-width: 60vmin;
  width: 60vmin;
  align-self: center;
}

.ndg-modal-content-border-locator {
  width: 60vmin;
  max-width: 60vmin;
  min-width: 60vmin;
  height: 60vmin;
  max-height: 60vmin;
  min-height: 60vmin;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10%;
  overflow: hidden;
  position: relative;
  align-self: center;
}
@keyframes expandToCenter {
  0% {
    left: var(--initX);
    top: var(--initY);
    width: var(--initWidth);
    height: var(--initHeight);
  }
  100% {
    left: var(--destX);
    top: var(--destY);
    width: var(--destWidth);
    height: var(--destHeight);
  }
}
.ndg-modal-content-border {
  //width: var(--initWidth);
  //max-width: var(--initWidth);
  min-width: var(--initWidth);
  //height: var(--initWeight);
  //max-height: var(--initHeight);
  min-height: var(--initHeight);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10%;
  overflow: hidden;
  position: fixed;
  align-self: center;
  left: 0;
  top: 0;
  animation: expandToCenter var(--duration-time) forwards;
  //transform: scale(0.2);
}

.ndg-modal-content-border > :nth-child(2) {
  /* background-color: rgba(255, 255, 255, 0.45); */
  width: 85%;
  height: 85%;
  position: absolute;
}

.ndg-modal-content-border > :nth-child(4) {
  position: absolute;
  bottom: 0%;
  left: 50%;
  transform: translateX(-50%);
}

.ndg-modal-content {
  top: 47%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  display: grid;
}

.ndg-modal-footer {
  position: relative;
  flex-grow: 1;
}

.ndg-modal-desc {
  position: absolute;
  font-size: 2vmax;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
  Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 2.5vmax;
  color: whitesmoke;
  font-weight: 200;
  align-self: center;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 100%;
  height: 30%;
  /* border: 1px solid brown; */
  border-radius: 3%;
  background-color: rgba(0, 0, 0, 0.35);
  animation: fadeIn var(--duration-time) forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  70% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.hor-vet-center {
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
}

.ndg-modal-right {
  height: 100%;
  width: 20vmax;
}

.ndg-modal-left {
  height: 100%;
  width: 20vmax;
}
</style>
<style scoped>
@media screen and (orientation: portrait) {
  * {
    --portrait-main-ratio: 0.8;
  }

  .ndg-modal-right {
    height: 100%;
    min-width: calc(calc(1 - var(--portrait-main-ratio)) *50vmin);
  }

  .ndg-modal-left {
    height: 100%;
    min-width: calc(calc(1 - var(--portrait-main-ratio)) *50vmin);
  }

  .ndg-modal-center {
    height: 100vmax;
    max-width: 80vmin;
    min-width: 80vmin;
    z-index: 10;
  }

  .ndg-modal-content-border {
    max-height: calc(var(--portrait-main-ratio) * 100vmin);
    min-height: calc(var(--portrait-main-ratio) * 100vmin);
    max-width: calc(var(--portrait-main-ratio) * 100vmin);
    min-width: calc(var(--portrait-main-ratio) * 100vmin);
  }
}
</style>
