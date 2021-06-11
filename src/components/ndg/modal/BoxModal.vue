<template >
  <!-- :style="{'filter': showFlag ?'blur(5px)':''}" -->
  <!-- <transition name="modal"> -->
  <div class="ndg-modal hor-vet-center" v-show="showFlag" :style="[popAnime,closeAnime]">
    <div class="ndg-modal-left"></div>
    <div class="ndg-modal-center">
      <div class="ndg-modal-header">
        <div class="ndg-modal-desc" v-if="editable" style="animation:none" @click="keepModal">
          {{box.name}}
          <my-icon className="delete" v-if="editable"></my-icon>
        </div>
        <!-- <slot name="header"></slot> -->
      </div>
      <transition name="modal">
        <div class="ndg-modal-content-border" @click="keepModal" v-show="showFlag">
          <shift-zone orientation="left" :flowOver="isDragging" @switchUnit="switchUnit" :delaySwitchTime="400"></shift-zone>
          <div class="ndg-modal-content">
            <box v-model="box" :multipleSize="13" :showAppName='true' :draggable="true"></box>
          </div>
          <shift-zone orientation="right" :flowOver="isDragging" @switchUnit="switchUnit" :delaySwitchTime="400"></shift-zone>
          <indicator v-model="box">
          </indicator>
          <!-- <slot name="content"></slot> -->
        </div>
      </transition>
      <div class="ndg-modal-footer">
        <!-- <slot name="footer"></slot> -->
      </div>
    </div>
    <div class="ndg-modal-right"></div>
  </div>
  <!-- </transition> -->
</template>

<script>
  import MyIcon from "../MyIcon.vue";
  import Box from "../Box.vue";
  // 右键点击出现的模态框
  import Indicator from "../Indicator.vue";
  import ShiftZone from "../ShiftZone.vue";
  export default {
    name: "box-modal",
    components: {
      indicator: Indicator,
      MyIcon: MyIcon,
      Box: Box,
      ShiftZone: ShiftZone
    },
    data() {
      return {
        editable: true,
        isDragging: true
      };
    },
    computed: {
      appGroups() {
        let groups = [];
        for (let i = 0; i < this.box.apps.length; ) {
          groups.push(this.box.apps.slice(i, (i += this.box.groupAppLimit)));
        }
        return groups;
      },
      popAnime() {
        return {
          "--init-scale": "0.4",
          "--init-pos": "0"
        };
      },
      closeAnime() {
        return {};
      }
    },
    model: {
      prop: "box",
      event: "changeBox"
    },
    props: {
      box: {
        type: Object,
        default: () => {
          return {};
        }
      },
      name: {
        type: String,
        default: () => {
          return "";
        }
      },
      showFlag: {
        type: Boolean,
        default: () => {
          return false;
        }
      },
      // 初始位置
      initPos: {
        type: Object,
        // default: '40%'
        default: () => {
          return {
            x: "40%",
            y: "40%",
            w: 0,
            h: 0
          };
        }
      }
    },
    methods: {
      changeModalShow(showFlag) {
        debugger;
        this.showFlag = showFlag;
      },
      keepModal($event) {
        // console.log($event);
        // 防止点击模态框的时候响应全局click关闭modal
        $event.stopPropagation();
      },
      scrollToAppGroup(ui) {
        // console.log("scrollToAppGroup", ui);
        this.box.displayNo = ui;
      },
      switchUnit(orientation) {
        let len = this.appGroups.length;
        if (orientation == "right" && this.box.displayNo < len - 1) {
          this.box.displayNo++;
        } else if (orientation == "left" && this.box.displayNo > 0) {
          this.box.displayNo--;
        }
      }
    },
    beforeCreate() {},
    mounted() {}
  };
</script>
<!-- 模态框css样式 -->
<style scoped>
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
.ndg-modal-header {
  flex-grow: 1;
  position: relative;
  max-width: 60vmin;
  left: 50%;
  transform: translateX(-50%);
}
.ndg-modal-center {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-items: auto;
  /* 以下css属性都要被动态class重置 */
  /* position: fixed; */
  height: 100vmin;
  max-width: 60vmax;
  min-width: 60vmax;
  z-index: 10;
}

.ndg-modal-content-border {
  max-width: 60vmin;
  min-width: 60vmin;
  max-height: 60vmin;
  min-height: 60vmin;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10%;
  overflow: hidden;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
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
@keyframes showModal {
  0% {
    transform: scale(var(--init-scale), var(--init-scale)) translate(20%, -165%);
    z-index: 3;
    opacity: 0.2;
  }
  100% {
    z-index: 3;
    opacity: 1;
    transform: scale(100%, 100%) translate(-50%, 0%);
  }
}
/* .modal-enter {
  z-index: -1;
  opacity: 0;
  width: 20%;
  height: 20%;
} */
.modal-enter {
  transform: scale(40%, 40%) translate(20%, -165%);
  z-index: 3;
  opacity: 0.2;
}
.modal-enter-to {
  z-index: 3;
  opacity: 1;
  transform: scale(100%, 100%) translate(-50%, 0%);
  animation: showModal 0.3s forwards;
}
</style>
<style scoped>
@media screen and (orientation: portrait) {
  * {
    --portrait-main-ratio: 0.8;
  }

  .ndg-modal-right {
    height: 100%;
    min-width: calc(calc(1-var(--portrait-main-ratio)) * 50vmin);
  }
  .ndg-modal-left {
    height: 100%;
    min-width: calc(calc(1-var(--portrait-main-ratio)) * 50vmin);
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