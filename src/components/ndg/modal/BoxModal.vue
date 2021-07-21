<template>
  <div class="ndg-modal hor-vet-center" style="z-index: -10" id="ndg-modal">
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
      <div class="ndg-modal-content-border-locator" style="visibility: hidden">
        `
        <!---->
      </div>
      <!-- 底部区域 -->
      <div class="ndg-modal-footer">
      </div>
    </div>
    <div class="ndg-modal-right"></div>
    <div id="ndg-modal-content-border" class="ndg-modal-content-border" :style="[durationTime,initRect,destRect,scaleRatio]"
      @click="($event)=>{$event.stopPropagation()}">
      <ShiftZone orientation="left" :flowOver="isDragging" @switchUnit="switchUnit" :delaySwitchTime="400"></ShiftZone>
      <div class="ndg-modal-content">
        <Box v-model="box" :enableDrag="enableDrag" :showAppName='true'></Box>
      </div>
      <ShiftZone orientation="right" :flowOver="isDragging" @switchUnit="switchUnit" :delaySwitchTime="400"></ShiftZone>
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
    beforeCreate() {},
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
            DOMRect: {
              width: 0,
              height: 0
            }
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
      }
    },
    model: {
      prop: "box",
      event: "changeBox"
    },
    watch: {
      portrait: {
        immediate: true,
        handler: function(portrait, oldVal) {
          this.destRect = this.calcModalRect(portrait);
          console.log(this.modalSize, portrait ? "竖屏" : "横屏", this.destRect);
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
        showModal: false,
        scaleRatio: this.calcRatio()
      };
    },
    computed: {
      // 初始化的位置和尺寸
      initRect() {
        return {
          "--initWidth": this.box.DOMRect ? this.box.DOMRect.width + "px" : "0px",
          "--initHeight": this.box.DOMRect
            ? this.box.DOMRect.width + "px"
            : +"0px",
          "--initX": this.box.DOMRect ? this.box.DOMRect.x + "px" : +"0px",
          "--initY": this.box.DOMRect ? this.box.DOMRect.y + "px" : +"0px"
        };
      },
      durationTime() {
        return {
          "--duration-time": this.duration + "ms"
        };
      }
    },
    mounted() {
      window.addEventListener("resize", $event => {
        console.log("模态框重置destPos");
        this.destRect = this.calcModalRect(this.portrait);
        this.scaleRatio = this.calcRatio(this.portrait);
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
        console.log(this.showModal);
        this.updatedTimer = Date.now();
        return;
      }
      this.updatedTimer = setTimeout(() => {
        console.log("模态框重置destPos");
        this.destRect = this.calcModalRect(this.portrait);
      }, debounceTime);
    },
    methods: {
      keepModal($event) {
        $event.stopPropagation();
      },
      // 打开模态框
      toggleModal() {
        if (!this.showModal) {
          // 模态框开启动画
          document.querySelector("#ndg-modal").style.zIndex = 10;
          let modalContent = document.querySelector("#ndg-modal-content-border");
          modalContent.classList.add("popAnime");
          modalContent.style.zIndex = 9999;
          setTimeout(() => {
            console.log(this.destRect);
            modalContent.style.width = this.destRect["--destWidth"];
            modalContent.style.height = this.destRect["--destHeight"];
            modalContent.style.left = this.destRect["--destX"];
            modalContent.style.top = this.destRect["--destY"];
            // modalContent.style.transform = this.destRect['--ratio'];
            // modalContent.style.filter  = 'blur(1px);'
            modalContent.classList.remove("popAnime");
          }, this.duration);
        } else {
          // 模态框关闭动画
          let modalContent = document.querySelector("#ndg-modal-content-border");
          modalContent.classList.add("closeAnime");
          setTimeout(() => {
            console.log(this.initRect);
            modalContent.style.width = this.initRect["--initWidth"];
            modalContent.style.height = this.initRect["--initHeight"];
            modalContent.style.left = this.initRect["--initX"];
            modalContent.style.top = this.initRect["--initY"];
            // modalContent.style.transform = this.destRect['--ratio'];
            modalContent.classList.remove("closeAnime");
            document.querySelector("#ndg-modal").style.zIndex = -10;
          }, this.duration);
        }
        this.showModal = !this.showModal;
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
        let vmin = Math.min(window.innerHeight, window.innerWidth) / 100;
        let vmax = Math.max(window.innerHeight, window.innerWidth) / 100;
        let destWidth = this.modalSize.width * vmin;
        let destHeight = this.modalSize.height * vmin;
        let initWidth = this.box.DOMRect ? this.box.DOMRect.width : 0;
        let initHeight = this.box.DOMRect ? this.box.DOMRect.height : 0;
        console.log(destWidth / initWidth, destHeight / initHeight);
        return {
          "--ratioX": destWidth / initWidth,
          "--ratioY": destHeight / initHeight
        };
      }
    }
  };
</script>
<!-- 模态框css样式 -->
<style scoped>
* {
  --duration-time: var(--duration-time);
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
  background-color: rgba(255, 255, 255, 0.3);
  /* filter: blur(5px); */
  z-index: 1;
  height: 100%;
  width: 100%;
}

.ndg-modal-center {
  display: flex;
  flex-direction: column;
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

@keyframes popAnime {
  0% {
    left: var(--initX);
    top: var(--initY);
    width: var(--initWidth);
    height: var(--initHeight);
    /*  transform: scale(1, 1); z-index: -1;*/
    opacity: 0.5;
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
  transition: all var(--duration-time) ease-in-out;
}

.ndg-modal-left {
  height: 100%;
  width: 20vmax;
  transition: all var(--duration-time) ease-in-out;
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

  .ndg-modal-center {
    height: 100vmax;
    max-width: 80vmin;
    min-width: 80vmin;
    z-index: 10;
  }
}
</style>
