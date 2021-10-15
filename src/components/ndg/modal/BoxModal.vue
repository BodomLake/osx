<template>
  <div class="ndg-modal hor-vet-center" style="z-index: -1" id="ndg-modal">
    <div class="ndg-modal-body"
         @dragover="bodyDragOver($event)"
         @dragenter="bodyDragEnter($event)"
         @dragleave="bodyDragLeave($event)"
         @drop="bodyDrop($event)">
      <div class="ndg-modal-header">
        <!-- app集合的描述 -->
        <div class="ndg-modal-desc" @click="($event)=>{$event.stopPropagation()}"
             :style="{'opacity': showModal? 1:0 }">
          {{ box.name }}
          <my-icon className="delete" v-show="enableDrag"></my-icon>
        </div>
      </div>
      <!-- app集合的内容，加一个初始化的位置，然后移动到屏幕的中央 -->
      <div class="ndg-modal-content-border-locator" style="visibility: hidden"></div>
      <!-- 底部区域 -->
      <div class="ndg-modal-footer">
      </div>
    </div>
    <div id="ndg-modal-content-border" class="ndg-modal-content-border"
         :style="[durationTime,initRect,destRect,scaleRatio]"
         @click="($event)=>{$event.stopPropagation()}">
      <ShiftZone orientation="left" :flowOver="isDragging" @switchUnit="switchUnit" :delaySwitchTime="400"></ShiftZone>
      <div class="ndg-modal-content">
        <Box v-model="box" :enableDrag="enableDrag" :showAppName='true' :appliedInModal="showModal"
             @shiftIntoModalFromDesk="shiftIntoModalFromDesk"
             @shiftIntoModalFromOtherModal="shiftIntoModalFromOtherModal"></Box>
      </div>
      <ShiftZone orientation="right" :flowOver="isDragging" @switchUnit="switchUnit" :delaySwitchTime="400"></ShiftZone>
      <Indicator v-model="box"></Indicator>
    </div>
  </div>
</template>

<script>
import MyIcon from "../MyIcon.vue";
import Box from "../box/Box.vue";
import Indicator from "./Indicator.vue";
import ShiftZone from "../ShiftZone.vue";
import {inRegion} from "@/components/ndg/common";
import {Timer} from "@/components/ndg/timer";
import mixin from "./mixin.js"

export default {
  name: "box-modal",
  components: {
    Indicator: Indicator,
    MyIcon: MyIcon,
    Box: Box,
    ShiftZone: ShiftZone
  },
  created() {
  },
  props: {
    desks: {
      type: Array,
      require: true,
      default: () => {
      }
    },
    modalIndex: {
      type: Object,
      default: () => {
        return {
          deskIndex: 0,
          boxIndex: 0,
          groupIndex: 0,
          appIndex: 0,
        }
      }
    },
    /*    box: {
          type: Object,
          require: true,
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
              displayNum: 0,
              groupAppLimit: 9,
              DOMRect: {
                width: 0,
                height: 0
              },
              outerDOMRect: {
                width: 0,
                height: 0
              },
            };
          }
        },*/
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
    portrait: {
      type: Boolean,
      default: () => {
        return window.innerHeight > window.innerWidth;
      }
    },
    modalSize: {
      type: Object,
      default: () => {
        return window.innerHeight > window.innerWidth
          ? {
            width: 80,
            height: 80
          }
          : {
            width: 60,
            height: 60
          };
      }
    },
    duration: {
      type: Number,
      default: 500
    },
  },
  model: {
    prop: "desks",
    event: "change"
  },
  watch: {
    portrait: {
      immediate: true,
      handler: function (portrait, oldVal) {
        this.destRect = this.calcModalRect(portrait);
      }
    }
  },
  data() {
    return {
      // 正在进行拖拽
      isDragging: true,
      // 生命周期防抖器
      updatedTimer: 0,
      // 模态目的地 几何信息
      destRect: {},
      // modal框是否在显示
      showModal: false,
      scaleRatio: this.calcRatio(),
      // 重置尺寸计时器
      resizeTimer: null,
      // 开关计时器
      toggleTimer: null,
      // 计时器，判断是否要关闭当前modal
      modalSuspendTimer: new Timer(),
    };
  },
  mixins: [mixin],
  computed: {
    box() {
      return this.desks[this.modalIndex.deskIndex].boxes[this.modalIndex.boxIndex];
    },
    // 初始化的位置和尺寸
    initRect() {
      return {
        "--initWidth": this.box.DOMRect ? this.box.DOMRect.width + "px" : "0px",
        "--initHeight": this.box.DOMRect ? this.box.DOMRect.width + "px" : +"0px",
        "--initX": this.box.DOMRect ? this.box.DOMRect.x + "px" : +"0px",
        "--initY": this.box.DOMRect ? this.box.DOMRect.y + "px" : +"0px"
      };
    },
    durationTime() {
      return {
        "--duration-time": this.duration + "ms"
      };
    },
  },
  mounted() {
    window.addEventListener("resize", $event => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(() => {
        // console.info("模态框重置destPos");
        this.destRect = this.calcModalRect(this.portrait);
        this.scaleRatio = this.calcRatio(this.portrait);
      }, 1000);
    });
  },
  updated() {
    // 防抖 200ms
    let debounceTime = this.debounceTime;
    if (!this.box.showModal) {
      return;
    }
    if (Date.now() - this.updatedTimer < debounceTime) {
      // 重置为当前时间
      console.info(this.showModal);
      this.updatedTimer = Date.now();
      return;
    }
    this.updatedTimer = setTimeout(() => {
      console.info("模态框重置destPos");
      this.destRect = this.calcModalRect(this.portrait);
    }, debounceTime);
  },
  methods: {
    setModalIndex(index) {
      console.log('定位Modal的index')
      Object.keys(this.modalIndex).forEach(key => {
        if (index[key]) {
          this.modalIndex[key] = index[key]
        }
      })
    },
    // 打开模态框
    toggle() {
      this.$forceUpdate();
      let modalContent = document.querySelector("div#ndg-modal-content-border");
      if (this.toggleTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.toggleTimer = setTimeout(() => {
        if (!this.showModal) {         // 模态框开启动画
          document.querySelector("div#ndg-modal").style.zIndex = 10;
          modalContent.classList.add("popAnime");
          modalContent.style.zIndex = 9999;
          setTimeout(() => {
          }, this.duration);
        } else {                      // 模态框关闭动画
          modalContent.classList.remove("popAnime");
          modalContent.classList.add("closeAnime");
          setTimeout(() => {
            modalContent.classList.remove("closeAnime");
            document.querySelector("div#ndg-modal").style.zIndex = -1;
          }, this.duration);
        }
        // 修改状态
        this.showModal = !this.showModal;
      }, 100);
    },
    scrollToAppGroup(ui) {
      // console.info("scrollToAppGroup", ui);
      this.box.displayNum = ui;
    },
    switchUnit(offset) {
      let len = this.box.appGroups.length;
      const result = this.box.displayNum + offset;
      if (inRegion(result, 0, len - 1)) {
        this.box.displayNum += offset;
      }
    },
    calcModalRect(portrait) {
      let vmin = Math.min(window.innerHeight, window.innerWidth) / 100;
      let vmax = Math.max(window.innerHeight, window.innerWidth) / 100;
      let clientX = portrait
        ? ((100 - this.modalSize.width) / 2) * vmin
        : 50 * vmax - (this.modalSize.width / 2) * vmin;
      let clientY = portrait
        ? 50 * vmax - (this.modalSize.height / 2) * vmin
        : ((100 - this.modalSize.height) / 2) * vmin;
      return {
        "--destWidth": this.modalSize.width * vmin + "px",
        "--destHeight": this.modalSize.height * vmin + "px",
        "--destX": clientX + "px",
        "--destY": clientY + "px"
      };
    },
    calcRatio() {
      if (!this.box) {
        return {
          "--ratioX": 1,
          "--ratioY": 1
        };
      }
      let vmin = Math.min(window.innerHeight, window.innerWidth) / 100;
      let vmax = Math.max(window.innerHeight, window.innerWidth) / 100;
      let destWidth = this.modalSize.width * vmin;
      let destHeight = this.modalSize.height * vmin;
      let initWidth = this.box.DOMRect ? this.box.DOMRect.width : 0;
      let initHeight = this.box.DOMRect ? this.box.DOMRect.height : 0;
      // console.info(destWidth / initWidth, destHeight / initHeight);
      return {
        "--ratioX": destWidth / initWidth,
        "--ratioY": destHeight / initHeight
      };
    },
    shiftIntoModalFromDesk(groupIndex) {
      this.$emit('shiftIntoModalFromDesk', groupIndex)
    },
    shiftIntoModalFromOtherModal(groupIndex) {
      this.$emit('shiftIntoModalFromOtherModal', groupIndex)
    },
  }
};
</script>
<!-- 模态框css样式 -->
<style scoped>
* {
  --duration-time: var(--duration-time);
  --destX: var(--destX);
  --destY: var(--destY);
  --initX: var(--initX);
  --initY: var(--initY);
  --initWidth: var(--initWidth);
  --initHeight: var(--initHeight);
  --destWidth: var(--destWidth);
  --destHeight: var(--destHeight);

}

.ndg-modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  transition: all var(--duration-time) ease-in-out;
}

.ndg-modal::before {
  content: "";
  position: fixed;
  right: 0;
  bottom: 0;
  /* border-radius: 5%; */
  background-color: rgba(255, 255, 255, 0.3);
  /* filter: blur(5px); */
  z-index: 1;
  height: 100%;
  width: 100%;
}

.ndg-modal-body {
  display: flex;
  flex-direction: column;
  height: 100vmin;
  max-width: 100vmax;
  min-width: 100vmax;
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

@keyframes popAnime {
  0% {
    left: var(--initX);
    top: var(--initY);
    width: var(--initWidth);
    height: var(--initHeight);
    /*  transform: scale(1, 1); z-index: -1;*/
    opacity: 0.2;
  }
  100% {
    left: var(--destX);
    top: var(--destY);
    width: var(--destWidth);
    height: var(--destHeight);
    /*  transform: scale(var(--ratioX), var(--ratioYz)); */
    z-index: 10;
    opacity: 1;
  }
}

@keyframes closeAnime {
  0% {
    left: var(--destX);
    top: var(--destY);
    width: var(--destWidth);
    height: var(--destHeight);
    z-index: 10;
    opacity: 1;
  }
  100% {
    left: var(--initX);
    top: var(--initY);
    width: var(--initWidth);
    height: var(--initHeight);
    z-index: -1;
    opacity: 0.5;
  }
}

.ndg-modal-content-border {
  left: var(--initX);
  top: var(--initY);
  min-width: var(--initWidth);
  min-height: var(--initHeight);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10%;
  overflow: hidden;
  position: fixed;
  align-self: center;
}

.popAnime {
  animation: popAnime var(--duration-time) forwards;
}

.closeAnime {
  animation: closeAnime var(--duration-time) forwards;
}

.ndg-modal-content-border > :nth-child(2) {
  /* background-color: rgba(255, 255, 255, 0.45); */
  width: 85%;
  height: 85%;
  position: absolute;
}

.ndg-modal-content-border > :nth-child(4) {
  position: absolute;
  bottom: 2%;
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
  transition: all var(--duration-time) ease-in-out;
  /* border: 1px solid brown; */
  border-radius: 3%;
  background-color: rgba(0, 0, 0, 0.35);
  animation: fadeIn var(--duration-time) forwards;
  z-index: 10;
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

</style>
<style scoped>
@media screen and (orientation: portrait) {
  * {
    --portrait-main-ratio: 0.8;
  }

  .ndg-modal-right {
    height: 100%;
    min-width: calc(calc(1 - var(--portrait-main-ratio)) * 50vmin);
  }

  .ndg-modal-left {
    height: 100%;
    min-width: calc(calc(1 - var(--portrait-main-ratio)) * 50vmin);
  }

  .ndg-modal-body {
    height: 100vmax;
    max-width: 100vmin;
    min-width: 100vmin;
    z-index: 10;
  }
}
</style>
