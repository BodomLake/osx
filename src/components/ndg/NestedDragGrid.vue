<template>
  <div class="ndg">
    <!-- 上下左右固定的盒子，拖入就会发生桌面位移，isDragging表示主界面的盒子拖动了，这些四周的固定盒子才允许被拖入 -->
    <shift-zone orientation="left" :flowOver="isDragging" @switchUnit="switchUnit" :size="3"></shift-zone>
    <shift-zone orientation="right" :flowOver="isDragging" @switchUnit="switchUnit" :size="3"></shift-zone>
    <!-- 'filter': modal.show? 'blur(4px)':'blur(0px)' -->
    <div class="ndg-background" :style="{'width': deskWidth,'transition': `${switchDeskTime}s all ease-in-out`}">
      <!-- 多个桌面 -->
      <template v-for="(desk, i) in desks">
        <!-- <desktop></desktop> -->
        <div class="ndg-desktop" :key="desk.id" :id="desk.id" :draggable="isDragging" @dragover="($event)=>{$event.preventDefault();}"
          @drop="dropIntoDesktop($event, i)" @dragenter="dragEnterDesktop($event, i)">
          <div class="ndg-container" :data-order="i">
            <!-- 多个外部盒子 -->
            <template v-for="(box, j) in desk.boxes">
              <div class="ndg-outer" :key="box.id" :id="box.id" :name="box.name" :data-order="j" @drag="appBoxnDrag"
                :style="{'transform': box.translate}" @dragover="handleDragover($event,i,j)" @dragenter="handleDragEnter" @dragleave="handleDragLeave"
                @drop="handleDrop($event, j)" draggable="true" @dragstart="boxStartDrag($event,this)" @dblclick="showModal($event, i,j)"
                :class="{'shakeAnime':shakeAnimeFlag}" @touchstart="touchstart" @touchend="touchend" @touchmove="touchmove">
                <!-- 大于等于100%宽度的 九宫格 -->
                <div class="ndg-content-border" v-show="!toggleBox(i,j)">
                  <box v-model="desk.boxes[j]" :multipleSize="5" :singleSize="17"></box>
                </div>
                <!-- 文件夹文字说明 -->
                <div class="ndg-desc" style="animation:none" v-show="!toggleBox(i,j)">{{box.name | resolveAppName}}</div> <!-- {{box.name}}-->
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
    <!-- 文件夹的模态框，要在确定了的情况下加以渲染，即同时满足当下的定位和双击事件-->
    <boxModal class="modal-show" v-model="desks[modal.index.desk].boxes[modal.index.box]" :modalInfo="modal" ref="modal">
    </boxModal>
  </div>
</template>

<script>
  // TODO: 还要做的事情有很多：模态框；通过悬停时间长短，决定是否放入还是换位；换位/并入的 动画 要做出来；
  // 并入，模态框拽出app，并入盒子，模态框消失在视野中，模糊度恢复到blur(0px);
  // TODO: 启用拖拽模式的时候，outerBox如果内部已经有9倍的盒子，就要让出DOM空间，给app放入，这样显得顺理成章，流畅；
  // ondragstart -> ondrag -> ondragenter -> ondragover -> ondragleave -> ondragend -> ondrop
  import { CONTAINER, OUTER, APP, DELAY, DESKTOP } from "./common.js";
  import MyIcon from "./MyIcon.vue";
  import ShiftZone from "./ShiftZone.vue";
  import BoxModal from "./modal/BoxModal.vue";
  import Box from "./Box.vue";
  import initMixin from "./mixins/initMixin.js";
  export default {
    name: "nested-drag-grid",
    components: {
      MyIcon: MyIcon,
      boxModal: BoxModal,
      box: Box,
      ShiftZone: ShiftZone
    },
    mixins: [initMixin],
    mounted() {
      setTimeout(() => {
        this.locateCoordinate();
        this.$forceUpdate();
      }, 300);
      window.addEventListener("keydown", $event => {
        let keyCode = $event.key;
        // debugger;
        switch (keyCode) {
          case "ArrowLeft":
            this.switchUnit("left");
            $event.preventDefault();
            break;
          case "ArrowRight":
            this.switchUnit("right");
            $event.preventDefault();
            break;
          case "ArrowUp":
            break;
          case "ArrowDown":
            break;
          case "Escape":
            this.modal.show = false;
          default:
        }
      });
      window.addEventListener("click", $event => {
        if (this.modal.show == true) this.modal.show = false;
      });
      window.addEventListener("touchend", $event => {
        if (this.modal.show == true) this.modal.show = false;
      });
    },
    data() {
      return {
        isDragging: false,
        // 被拖拽的DOM
        draggingDom: {
          desk: {
            body: {},
            index: undefined
          },
          box: {
            body: {},
            index: undefined
          },
          app: {
            body: {},
            index: undefined
          },
          translated: false
        },
        // 被置换的DOM
        replacedDom: {
          desk: {
            body: {},
            index: undefined
          },
          box: {
            body: {},
            index: undefined
          },
          app: {
            body: {},
            index: undefined
          }
        },
        // 模态框的数据
        modal: {
          show: false,
          index: {
            desk: 0,
            box: 0
          },
          position: {
            clientX: 0,
            clientY: 0,
            x: 0,
            y: 0,
            offsetX: 0,
            offsetY: 0,
            pageX: 0,
            pageY: 0
          },
          draggable: false
        },
        // 启用拖拽？
        enableDrag: true,
        // 是否要切换桌面的计时器 DELAY是给用户的考虑时间
        intentToSwitch: {},
        // 拖拽跨过-节流计时器
        dragOverTimer: true
      };
    },
    computed: {
      // 拖拽模式下的动画开关
      shakeAnimeFlag() {
        return !this.enableDrag;
      }
    },
    methods: {
      // 移动端适配 事件
      touchstart($event) {
        // if (this.modal.show == false) this.modal.show = true;
        console.log("touchstart", $event);
        $event.preventDefault();
      },
      touchmove($event) {
        console.log("touchmove", $event);
      },
      touchend($event) {
        if (this.modal.show == false) this.modal.show = true;
        $event.stopPropagation();
        console.log("touchend", $event);
      },
      appBoxnDrag($event) {
        // console.log("内部", $event);
      },
      appGroupOnDrag($event) {
        // console.log("外部", $event);
      },
      appGroupDragStart($event, appIndex) {
        $event.stopPropagation();
        // 确定拖拽的是哪个dom
        this.isDragging = true;
        console.log("%c开始拖拽", "color:red");
        let xpath = $event.path;
        // this.locateDraggingDOM(xpath, this.draggingDom);
      },
      boxStartDrag($event) {
        this.isDragging = true;
        console.log("%c开始拖拽", "color:blue");
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.draggingDom);
        // 获取下标
        let deskIndex = this.draggingDom.desk.index;
        let boxIndex = this.draggingDom.box.index;
        let boxDisplayNo = this.desks[deskIndex].boxes[boxIndex].displayNo;
        // 找到被拖拽的元素
        let dragShowElement = document.getElementsByClassName(DESKTOP)[deskIndex]
          .children[0].children[boxIndex].children[0].children[0].children[
          boxDisplayNo
        ];
        // 设置好拖拽鼠标指示的内容
        $event.dataTransfer.effectAllowed = "link";
        // console.log(dragShowElement.clientHeight,dragShowElement.clientWidth)
        if (dragShowElement) {
          $event.dataTransfer.setDragImage(
            dragShowElement,
            dragShowElement.clientWidth / 2 + 43,
            dragShowElement.clientHeight / 2 + 36
          );
        }
      },
      handleDrop($event) {
        console.log("%c==========>Drop进入box\n", "color:blue", $event);

        // 组见切换位置，位置互调
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.replacedDom);
        this.isDragging = false;
        $event.stopPropagation();
        // 不要让drop事件向desktop传播
        $event.stopPropagation();
      },
      // 模态框单个app，或者整个box 拖入desktop，应该追加到该桌面的最后一个位子 push();
      dropIntoDesktop($event, destDeskIndex) {
        console.log("%c拖拽Drop并入桌面\n", "color:green", $event, destDeskIndex);
        let draggingDom = this.desks[this.draggingDom.desk.index].boxes[
          this.draggingDom.box.index
        ];
        this.desks[destDeskIndex].boxes.push(draggingDom);
        this.desks[this.draggingDom.desk.index].boxes.splice(
          this.draggingDom.box.index,
          1
        );
      },
      dragEnterDesktop($event, deskIndex) {
        // console.log("%c拖拽Enter并入桌面\n", "color:green", $event, deskIndex);
        $event.preventDefault();
      },
      // 处理动画 N*M宫格
      handleDragover($event, deskIndex, boxIndex) {
        const debounceTime = 100;
        $event.preventDefault();
        // return;
        // 节流200ms一次输出
        if (!this.dragOverTimer) {
          return;
        }
        this.dragOverTimer = false;
        setTimeout(() => {
          // console.log(
          //   "被拖拽的Box的序列号",
          //   this.draggingDom.desk.index,
          //   this.draggingDom.box.index
          // );

          // 防抖
          this.dragOverTimer = true;
          if (!this.isDragging) {
            return;
          }
          console.log(
            "%c ===========>box handle dragover debounce↓↓↓↓↓",
            "color:red"
          );
          // 遍历桌面
          let containers = Array.from(document.querySelectorAll("." + CONTAINER));
          let boxes = containers[this.currentDeskNo].children;
          for (let bid = 0; bid < boxes.length; bid++) {
            let domRect = this.desks[this.currentDeskNo].boxes[bid].DOMRect;
            // 定位到BOX的矩形范围内，得到具体的BOX下标
            if (
              domRect.left < $event.clientX &&
              domRect.top < $event.clientY &&
              domRect.right > $event.clientX &&
              domRect.bottom > $event.clientY
            ) {
              console.log(domRect);
              console.log("已定位到BOX：", this.currentDeskNo, bid);
              break;
            }
          }
          console.log(
            "offset",
            $event.offsetX,
            $event.offsetY,
            "client",
            $event.clientX,
            $event.clientY,
            "page",
            $event.pageX,
            $event.pageY
          );

          // 交换dom，交换array内部元素的下表
        }, debounceTime);
        $event.stopPropagation();
      },
      // 处理拖入 suspendTime计时判断，悬停位置最后的offset 相关动画，行为（并入）
      handleDragEnter($event) {},
      // 处理拖出
      handleDragLeave($event) {},
      // 定位正在被拖拽的盒子是哪一个？ 不光要定位，还要指定
      locateDraggingDOM(xpath, targetDOM) {
        for (let i = 0; i < xpath.length; i++) {
          if (xpath[i].className && xpath[i].tagName == "DIV") {
            if (xpath[i].className.indexOf(APP) != -1) {
              if (this.modal.show && this.enableDrag) {
                console.log("inner-app确定被拖拽的DOM", xpath[i].dataset.order);
                targetDOM.app.body = xpath[i];
                targetDOM.app.index = xpath[i].dataset.order;
              }
            }
            if (xpath[i].className.indexOf(OUTER) != -1) {
              console.log("outer-box确定被拖拽的DOM", xpath[i].dataset.order);
              targetDOM.box.body = xpath[i];
              targetDOM.box.index = xpath[i].dataset.order;
            }
            if (xpath[i].className.indexOf(CONTAINER) != -1) {
              console.log("desktop确定被拖拽的DOM", xpath[i].dataset.order);
              targetDOM.desk.body = xpath[i];
              targetDOM.desk.index = xpath[i].dataset.order;
            }
          }
        }
      },
      // 打开该文件筐的模态窗
      showModal($event, deskIndex, boxIndex) {
        // 只有多应用才能打开模态框
        console.log("showModal", {
          offsetX: $event.offsetX,
          offsetY: $event.offsetY,
          x: $event.x,
          y: $event.y,
          clientX: $event.clientX,
          clientY: $event.clientY,
          pageX: $event.pageX,
          pageY: $event.pageY
        });
        if (this.desks[deskIndex].boxes[boxIndex].apps.length > 1) {
          this.modal.index.desk = deskIndex;
          this.modal.index.box = boxIndex;
          this.modal.show = !this.modal.show;
          let xpath = $event.path;

          this.modal.position = {
            offsetX: $event.offsetX,
            offsetY: $event.offsetY,
            x: $event.x,
            y: $event.y,
            clientX: $event.clientX,
            clientY: $event.clientY,
            pageX: $event.pageX,
            pageY: $event.pageY
          };
        }
      },
      // 被点击的BOX会弹出模态框，同时BOX消失
      toggleBox(deskIndex, boxIndex) {
        return (
          this.modal.show &&
          this.modal.index.desk == deskIndex &&
          this.modal.index.box == boxIndex
        );
      }
    },
    filters: {
      resolveAppName(appName) {
        if (appName || appName != "") {
          return appName;
        } else {
          return "app-box";
        }
      }
    }
  };
</script>
<!-- 盒子布局样式，内部app显示样式 -->
<style scoped>
.ndg {
  position: fixed;
  top: 0%;
  left: 0%;
  width: 100%;
  height: 100%;
}
.ndg::before {
  content: "";
  position: absolute;
  top: 0%;
  left: 0%;
  background-image: url("../../assets/iMac.jpg");
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  /* transform: rotate(-90deg); */
  width: 100%;
  height: 100%;
}
@media screen and (orientation: portrait) {
  .ndg::before {
    background-image: url("../../assets/Beach.jpg");
  }
}
/* 主题背景，大背景，大布局 */
.ndg-background {
  padding: 0;
  overflow-x: hidden;
  margin: 0 auto;
  width: 100vw;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: row;
  transition: 0.5s all ease-in-out;
}
/* 当前桌面 */
.ndg-desktop {
  height: 100%;
  position: relative;
  /* display: flex; */
  flex-direction: row;
  width: 100%;
  /* 偏移量的改变就是移动桌面 每次移动X = 100/n */
}

/* ndg容器布局 */
.ndg-container {
  margin: 0 auto;
  display: flex;
  display: -webkit-flex;
  display: -ms-flexbox;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: flex-start;
  align-content: stretch;
  width: 100vmin;
  height: 100vmin;
}

/* 十六宫格四等分 4*4 */
.ndg-outer {
  display: flex;
  display: -webkit-flex;
  flex-direction: column;
  flex-wrap: no-wrap;
  justify-content: space-around;
  flex-grow: 1;
  /* 限制宽度 */
  min-width: calc(calc(100% / 4));
  max-width: calc(calc(100% / 4));
  /* 限制高度 */
  max-height: calc(calc(100% / 4));
  min-height: calc(calc(100% / 4));
  align-self: stretch;
  box-sizing: border-box;
  border-radius: 10%;
  cursor: pointer;
  padding: 0.4rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.5s ease;
}

.ndg-content-border {
  /* border: 1px solid white; */
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 5%;
  box-shadow: 1px 1px 5px 1px rgb(0 0 0 / 60%);
  overflow: hidden;
}
.ndg-content-border::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  border-radius: 5%;
  -webkit-filter: blur(2px);
  -moz-filter: blur(1px);
  -ms-filter: blur(2px);
  -o-filter: blur(2px);
  filter: blur(5px);
  z-index: -1;
  background-image: url("../../assets/iMac.jpg");
  background-position: center center;
  background-size: contain;
  background-attachment: initial;
  box-shadow: 1px 1px 10px 1px rgb(0 0 0 / 60%);
  height: 100%;
  width: 100%;
}
.ndg-scroll-box {
  display: flex;
  flex-direction: row;
  height: 100%;
  position: relative;
  transition: 0.5s all ease-in-out;
}
.ndg-app-group {
  width: 100%;
  height: 100%;
  border-radius: 10%;
  display: flex;
  flex-direction: row;
  flex-grow: 10;
  flex-wrap: wrap;
  align-self: center;
  align-content: flex-start;
  flex-grow: 1;
  transition: 0.5s all ease-in-out;
  /* z-index: -1; */
}
/* 九宫格三等分 3*3 */
.ndg-app {
  box-sizing: border-box;
  flex-grow: 1;
  /* background-color: beige; */
  border-radius: 3%;
  cursor: pointer;
  position: relative;
  /* border: 1px solid red; */
  /* 限制宽度 */
  min-width: calc(calc(100% / 3));
  max-width: calc(calc(100% / 3));
  /* 限制高度 */
  min-height: calc(calc(100% / 3));
  max-height: calc(calc(100% / 3));
}

.ndg-desc {
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  /* align-self: flex-end; */
  /* position: absolute; */
  bottom: 0rem;
  color: whitesmoke;
  font-weight: 400;
  align-self: center;
}

/* 实现抖动 */
@keyframes shakeAnime {
  0% {
    transform: scale(1) rotate(0);
    transform: scale(1) rotate(0);
  }

  25% {
    transform: scale(1) rotate(-0.5deg);
    transform: scale(1) rotate(-0.5deg);
  }

  50% {
    transform: scale(1) rotate(0.5deg);
    transform: scale(1) rotate(0.5deg);
  }

  75% {
    transform: scale(1) rotate(-0.5deg);
    transform: scale(1) rotate(-0.5deg);
  }

  100% {
    transform: scale(1) rotate(0);
    transform: scale(1) rotate(0);
  }
}
.shakeAnime {
  animation: shakeAnime 0.5s both infinite;
}
.ndg-background::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.ndg-background::-webkit-scrollbar-thumb {
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
.ndg-background::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ededed;
  border-radius: 10px;
}
@keyframes showModal {
  0% {
    z-index: -1;
    opacity: 0;
    width: 100%;
    height: 100%;
  }
  100% {
    z-index: 3;
    opacity: 1;
  }
}
.modal-show {
  /* animation: showModal 1s both; */
}
@media screen and (orientation: portrait) {
  .ndg-container {
    width: 100vmin;
    height: 100vmax;
    align-content: flex-start;
  }
  .ndg-outer {
    /* 限制宽度 */
    min-width: calc(calc(100% / 4));
    max-width: calc(calc(100% / 4));
    /* 限制高度 */
    max-height: calc(calc(100% / 8));
    min-height: calc(calc(100% / 8));
  }
  .ndg-desc {
    font-size: 2vmin;
  }
}
</style>