<template>
  <div class="ndg">
    <!-- 上下左右固定的盒子，拖入就会发生桌面位移，isDragging表示主界面的盒子拖动了，这些四周的固定盒子才允许被拖入 -->
    <!-- <shift-zone orientation="top" :flowOver="isDragging" @switchUnit="switchUnit"></shift-zone> -->
    <shift-zone orientation="left" :flowOver="isDragging" @switchUnit="switchUnit" :size="3"></shift-zone>
    <shift-zone orientation="right" :flowOver="isDragging" @switchUnit="switchUnit" :size="3"></shift-zone>
    <!-- <shift-zone orientation="bottom" :flowOver="isDragging" @switchUnit="switchUnit"></shift-zone> -->

    <div class="ndg-background" :style="{'width': deskWidth}">
      <!-- 多个桌面 -->
      <template v-for="(desk, i) in desks">
        <div class="ndg-desktop" :key="desk.id" :id="desk.id" :draggable="isDragging" @drop="dropIntoDesktop($event, i)"
          @dragenter="dragEnterDesktop($event, i)" @dragover="handleDragover">
          <div class="ndg-container" :data-order="i">
            <!-- 多个外部盒子 -->
            <template v-for="(box, j) in desk.boxes">
              <div class="ndg-outer" :key="box.id" :id="box.id" :name="box.name" :data-order="j" @dragover="handleDragover" @drag="appBoxnDrag"
                @drop="outerOnDrop($event, j)" draggable="true" @dragstart="boxStartDrag($event,this)" @dblclick="showModal(i,j)"
                :class="{'shakeAnime':shakeAnimeFlag}" @touchstart="touchstart" @touchend="touchend" @touchmove="touchmove">
                <!-- 大于等于100%宽度的 九宫格 -->
                <div class="ndg-content-border">
                  <box v-model="desk.boxes[j]" :multipleSize="5" :singleSize="17" ref="box"></box>
                </div>
                <!-- 文件夹文字说明 -->
                <div class="ndg-desc" style="animation:none">{{box.apps[0].name | resolveAppName}}</div> <!-- {{box.name}}-->
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
    <!-- 文件夹的模态框，要在确定了的情况下加以渲染，即同时满足当下的定位和双击事件-->
    <!-- <keep-alive> -->
      <boxModal v-show="modal.show" v-model="desks[modal.index.desk].boxes[modal.index.box]" :showFlag="modal.show" ref="modal">
      </boxModal>
    <!-- </keep-alive> -->

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
    mounted() {
      setTimeout(() => {
        // console.clear();
        // this.locateCoordinate();
      }, 1000);
    },
    mixins: [initMixin],

    mounted() {
      window.addEventListener("keydown", $event => {
        let keyCode = $event.key;
        // debugger;
        switch (keyCode) {
          case "ArrowLeft":
            $event.preventDefault();
            this.switchUnit("left");
            break;
          case "ArrowRight":
            $event.preventDefault();
            this.switchUnit("right");
            break;
          case "ArrowUp":
            $event.preventDefault();
            break;
          case "ArrowDown":
            $event.preventDefault();
            break;
          case "Escape":
            this.modal.show = false;
          default:
        }
      });
      window.addEventListener("click", $event => {
        if (this.modal.show == true) this.modal.show = false;
        // console.log($event)
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
            index: 0
          },
          box: {
            body: {},
            index: 0
          },
          app: {
            body: {},
            index: 0
          }
        },
        // 被置换的DOM
        replacedDom: {
          desk: {
            body: {},
            index: 0
          },
          box: {
            body: {},
            index: 0
          },
          app: {
            body: {},
            index: 0
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
            clientY: 0
          },
          draggable: false
        },
        // 启用拖拽？
        enableDrag: true,
        // 是否要切换桌面的计时器 DELAY是给用户的考虑时间
        intentToSwitch: {}
      };
    },
    computed: {
      // 拖拽模式下的动画开关
      shakeAnimeFlag() {
        return !this.enableDrag;
      },
      boxContent() {
        return this.desks[this.modal.index.desk].boxes[this.modal.index.box];
      }
    },
    methods: {
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
        this.locateDraggingDOM(xpath, this.draggingDom);
      },
      boxStartDrag($event) {
        this.isDragging = true;
        console.log("%c开始拖拽", "color:blue");
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.draggingDom);
        // TODO:目前默认拖拽显示的图片元素是 appBox当前显示的组
        let deskIndex = this.draggingDom.desk.index;
        let boxIndex = this.draggingDom.box.index;
        let boxDisplayNo = this.desks[deskIndex].boxes[boxIndex].displayNo;
        // console.log(this.$refs.box, "\n");
        let dragShowElement = document.getElementsByClassName(DESKTOP)[deskIndex]
          .children[0].children[boxIndex].children[0].children[0].children[
          boxDisplayNo
        ];

        $event.dataTransfer.effectAllowed = "link";
        // console.log(dragShowElement.clientHeight,dragShowElement.clientWidth)
        if (dragShowElement) {
          $event.dataTransfer.setDragImage(
            dragShowElement,
            dragShowElement.clientWidth / 2 + 32,
            dragShowElement.clientHeight / 2 + 32
          );
        }
      },
      innerOnDrop($event) {
        // 不要让内部拖拽事件冒泡成为外部拖拽事件
        // $event.stopPropagation();
        console.log("%c内部drop in\n", "color:red", $event);
        // 组内切换位置，位置互调
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.replacedDom);
        this.isDragging = false;
      },
      // TODO: 先判断是不是要交换位置，还是说单app并入文件筐
      // iOS不支持文件筐的app导入单个app框形成新的文件筐
      // 必须点击文件筐打开模态框，并且进入拖拽模式，才能允许控制文件筐的app拖拽到其他
      outerOnDrop($event) {
        console.log("%c drop进入box \n", "color:blue", $event);
        // 组见切换位置，位置互调
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.replacedDom);
        this.isDragging = false;

        // app
        let swap = {};
        // 把被拖拽的交给swap
        swap = this.desks[this.draggingDom.desk.index].boxes[
          this.draggingDom.box.index
        ];
        // 被拖拽的DOM和 被顶替的交换
        this.desks[this.draggingDom.desk.index].boxes[
          this.draggingDom.box.index
        ] = this.desks[this.replacedDom.desk.index].boxes[
          this.replacedDom.box.index
        ];
        // 被顶替的交换 和 swap（被拖拽的交换）
        this.desks[this.replacedDom.desk.index].boxes[
          this.replacedDom.box.index
        ] = swap;
        // 不要让drop事件向desktop传播
        $event.stopPropagation();
      },
      // 模态框单个app，或者整个box 拖入desktop，应该追加到该桌面的最后一个位子 push();
      dropIntoDesktop($event, destinationDeskIndex) {
        console.log(
          "%c拖拽Drop并入桌面\n",
          "color:green",
          $event,
          destinationDeskIndex
        );
        // 整个box的情况，追加Box，把原来的删了
        // return;

        let draggingDom = this.desks[this.draggingDom.desk.index].boxes[
          this.draggingDom.box.index
        ];
        // if (draggingDom.innerBoxes.length == 0 && draggingDom.innerBoxes) {
        this.desks[destinationDeskIndex].boxes.push(draggingDom);
        this.desks[this.draggingDom.desk.index].boxes.splice(
          this.draggingDom.box.index,
          1
        );
        // }

        // 模态框单个app
      },
      dragEnterDesktop($event, deskIndex) {
        // console.log("%c拖拽Enter并入桌面\n", "color:green", $event, deskIndex);
        $event.preventDefault();
      },
      handleDragover($event) {
        // console.log("外部dragover", $event);
        // $event.stopPropagation();
        $event.preventDefault();
      },
      innerDragover($event) {
        // console.log("内部dragover", $event);
        // $event.stopPropagation();
        $event.preventDefault();
      },
      // 定位正在被拖拽的盒子是哪一个？ 不光要定位，还要指定
      locateDraggingDOM(xpath, targetDOM) {
        for (let i = 0; i < xpath.length; i++) {
          // console.log(xpath[i].className);
          // 首先得是DIV标签，然后在判断是否有NDG专属的className
          if (xpath[i].className && xpath[i].tagName == "DIV") {
            // 给正在拖拽的，拖拽目的地的 DOM 具体化；
            if (xpath[i].className.indexOf(APP) != -1) {
              // 如果不是 使能拖拽的情况就不要定位
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
      showModal(deskIndex, boxIndex) {
        // 只有多应用才能打开模态框
        if (this.desks[deskIndex].boxes[boxIndex].apps.length > 1) {
          this.modal.index.desk = deskIndex;
          this.modal.index.box = boxIndex;
          this.modal.show = !this.modal.show;
        }
      },
      // 左右方向：进行一段延时之后 滑动桌面
      // 上下方向：方便用户上下滚动 scrollToTop scrollToBottom
      onMouseEnter($event, orientation) {
        console.log($event, orientation);
        // let shiftDOM = $event.target;
        // shiftDOM.style.backgroundImage = `linear-gradient(to ${orientation}, rgb(146 148 248 / 10%), rgb(255 255 255 / 50%))`;
      },
      onMouseOut($event, orientation) {
        console.log($event, orientation);
        // let shiftDOM = $event.target;
        // shiftDOM.style.backgroundImage = "";
      },
      // TODO: 切换桌面
      intentToDragOver($event, orientation) {
        console.log("拖入，准备切换桌面", $event.target, orientation);
        // 判断 orientation (left right up down)决定主界面平移方向  scrollTo()来垂直拉动 水平移动

        // 垂直移动 clientHeight减去DIV.ndg-background的的scrollHeight是垂直活动的空间，增减scrollTop实现偏移
        // 水平移动 .ndg-background的DIV的scrollWidth属性的 1/n 来计算每次平移的偏移量，增减scrollLeft实现偏移
        // 或者 clientWidth减去DIV.ndg-background的的scrollWidth作为水平活动的空间，增减scrollLeft实现偏移

        // 水平移动 也可以考虑 在 overflow:hidden translateX() 和 translateY() 每次偏移量为 100%/n

        let shiftDOM = $event.target;
        let colorStart = "rgb(146 148 248 / 10%)";
        let colorEnd = "rgb(255 255 255 / 50%)";
        shiftDOM.style.backgroundImage = `linear-gradient(to ${orientation}, ${colorStart}, ${colorEnd})`;
        // 切换桌面
        this.intentToSwitch = setTimeout(() => {
          this.switchUnit(orientation);
        }, DELAY);
      },
      intentDiscardDrag($event, orientation) {
        console.log("撤出，放弃切换桌面", $event.target);
        // 放弃切换桌面，把背景模糊颜色消除
        let shiftDOM = $event.target;
        shiftDOM.style.backgroundImage = "";
        this.intentToSwitch = null;
      }
    },
    watch: {
      data(newValue, oldValue) {}
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
  background-image: url("../../assets/Wallpaper.jpg");
}
/* 主题背景，大背景，大布局 */
.ndg-background {
  padding: 0;
  overflow-x: hidden;
  margin: 0 auto;
  width: 100vw;
  max-height: 100vh;
  display: flex;
  flex-direction: row;
  transition: 0.5s all ease-in-out;
  transform: translateX(0%);
}
/* 当前桌面 */
.ndg-desktop {
  height: 100vh;
  position: relative;
  /* display: flex; */
  flex-direction: row;
  width: 100%;
  /* 偏移量的改变就是移动桌面 每次移动X = 100/n */
}

/* ndg容器布局 */
.ndg-container {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  display: flex;
  display: -webkit-flex;
  display: -ms-flexbox;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: flex-start;
  align-content: stretch;
  width: 100vmin;
  height: 100vmin;
  /* padding: 3rem 16rem; */
  /* border: 1px solid green; */
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
  /* border: 1px solid white; */
  /* box-shadow: 0 5px 10px rgb(0 0 0 / 50%) inset; */
  padding: 0.4rem;
  position: relative;
  overflow: hidden;
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
  background-image: url("../../assets/Wallpaper.jpg");
  background-position: center top;
  background-size: cover;
  background-attachment: fixed;
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
  /* transform: translateX(0%); */
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
  font-size: 1vmin;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  /* align-self: flex-end; */
  /* position: absolute; */
  bottom: 0rem;
  color: whitesmoke;
  font-weight: 200;
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