<template>
  <div class="ndg">
    <!-- 上下左右固定的盒子，拖入就会发生桌面位移，isDragging表示主界面的盒子拖动了，这些四周的固定盒子才允许被拖入 -->
    <div class="ndg-shift-top ndg-shift" :style="{'z-index':isDragging?'3':'-1'}" :draggable="isDragging" @dragenter="intentToDragOver($event,'top')"
      @dragleave="intentDiscardDrag($event,'top')"></div>
    <div class="ndg-shift-left ndg-shift" :style="{'z-index':isDragging?'3':'-1'}" :draggable="isDragging"
      @dragenter="intentToDragOver($event,'left')" @dragleave="intentDiscardDrag($event,'right')"></div>
    <div class="ndg-shift-right ndg-shift" :style="{'z-index':isDragging?'3':'-1'}" :draggable="isDragging"
      @dragenter="intentToDragOver($event,'right')" @dragleave="intentDiscardDrag($event,'right')"></div>
    <div class="ndg-shift-bottom ndg-shift" :style="{'z-index':isDragging?'3':'-1'}" :draggable="isDragging"
      @dragenter="intentToDragOver($event,'bottom')" @dragleave="intentDiscardDrag($event,'bottom')"></div>
    <!--  @dragenter="intentToDragOver($event,'top')" @dragleave="intentDiscardDrag($event,'top')" -->

    <div class="ndg-background" :style="{'width': deskWidth}">

      <!-- 多个桌面 -->
      <template v-for="(desk, i) in desks">
        <div class="ndg-desktop" :key="desk.id" :id="desk.id" :draggable="isDragging" @drop="dropIntoDesktop($event, i)"
          @dragenter="dragEnterDesktop($event, i)" @dragover="handleDragover">
          <div class="ndg-container" :data-order="i">
            <!-- 多个外部盒子 -->
            <template v-for="(outerItem, j) in desk.boxes">
              <div class="ndg-outer" :key="outerItem.id" :id="outerItem.id" :name="outerItem.name" :data-order="j" @dragover="handleDragover"
                @drag="appBoxnDrag" @drop="outerOnDrop" draggable="true" @dragstart="boxStartDrag($event)" @dblclick="showModal(i,j)"
                :class="{'shakeAnime':shakeAnimeFlag}">
                <!-- 大于等于100%宽度的 九宫格 -->
                <div class="ndg-content-border">
                  <div class="ndg-scroll-box" :style="{'width': calcWidth(splitArr(outerItem.innerBoxes, 9))}">
                    <!-- 属于文件夹，九宫格模式，默认分割为9个一组，每一组作为一个大方格，含有9个或者以下的方格 -->
                    <template v-for="(group, k) in splitArr(outerItem.innerBoxes, 9) ">
                      <div class="ndg-box-group" :key="k" :data-fullpathOrder="i + '-' + j + '-' + k">
                        <!-- 九个app -->
                        <template v-for="(innerItem, l) in group">
                          <!-- @dragstart="appGroupDragStart($event)"  @drop="innerOnDrop"  @dragover="innerDragover" :draggable="isDragging"  @drag="appOnDrag" -->
                          <div class="ndg-app" :key="innerItem.id" :name="innerItem.name" :data-group="k" :data-order="9*k+l" :id="innerItem.id">
                            <my-icon :className="innerItem.name" v-if="innerItem.name!==''" :singleBox="outerItem.innerBoxes.length == 1"></my-icon>
                          </div>
                        </template>
                      </div>
                    </template>
                    <!-- 如果不属于文件夹，也是innerBox长度为0 -->
                    <template v-if="outerItem.innerBoxes.length == 0">
                      <my-icon :className="outerItem.name" :singleBox="true"></my-icon>
                    </template>
                  </div>
                </div>
                <!-- 文件夹文字说明 -->
                <div class="ndg-desc" style="animation:none">{{outerItem.name | resolveAppName}}</div> <!-- {{outerItem.name}}-->

              </div>
            </template>
          </div>
        </div>
      </template>

    </div>
    <!-- 文件夹的模态框，要在确定了的情况下加以渲染 -->
    <div class="ndg-modal" :class="{'ndg-modal-show':modal.show}" v-if="modal.show" ref="ngd-modal">
      <div class="ngd-modal-header">
        <div class="ndg-modal-desc" style="animation:none">文件集合</div>
      </div>
      <div class="ngd-modal-content">
      </div>
      <div class="ngd-modal-footer">
      </div>
    </div>

  </div>
</template>

<script>
  // ondragstart -> ondrag -> ondragenter -> ondragover -> ondragleave -> ondragend -> ondrop
  const PREFIX = "ndg-";
  const CONTAINER = PREFIX + "container";
  const OUTER = PREFIX + "outer";
  const APP = PREFIX + "app";
  import MyIcon from "./MyIcon.vue";
  import initMixin from "./initMixin.js";
  export default {
    components: { MyIcon },
    name: "nested-drag-grid",
    mounted() {
      setTimeout(() => {
        // console.clear();
        // this.locateCoordinate();
      }, 1000);
    },
    mixins: [initMixin],
    props: {},
    mounted() {
      window.addEventListener("keydown", $event => {
        let keyCode = $event.key;

        switch (keyCode) {
          case "ArrowLeft":
            $event.preventDefault();
            console.log("左移");
            break;
          case "ArrowRight":
            $event.preventDefault();
            break;
          case "ArrowUp":
            $event.preventDefault();
            break;
          case "ArrowDown":
            $event.preventDefault();
            break;
          default:
        }
      });
    },
    data() {
      return {
        isDragging: false,
        currentDeskNum: 0,
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
          draggable: false
        },
        // 启用拖拽？
        enableDrag: true
      };
    },
    computed: {
      // 拖拽模式下的动画开关
      shakeAnimeFlag() {
        return !this.enableDrag;
      }
    },
    methods: {
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
      boxStartDrag($event, boxIndex) {
        this.isDragging = true;
        console.log("%c开始拖拽", "color:blue");
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.draggingDom);
        // TODO:默认拖拽显示的图片元素是 appBox里面的第一组
        let dragShowElement = document.querySelector(
          `div.ndg-box-group[data-fullpathOrder='${this.draggingDom.desk.index}-${this.draggingDom.box.index}-0']`
        );
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
              console.log("inner-app确定被拖拽的DOM", xpath[i].dataset.order);
              // 如果不是 使能拖拽的情况就不要定位
              if (!this.modal.show && this.enableDrag) {
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
        this.modal.index.desk = deskIndex;
        this.modal.index.box = boxIndex;
        this.modal.show = this.modal.show ? false : true;
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
        let transform = () => {
          document.querySelector(
            "div.ndg-background"
          ).style.transform = `translateX(-${25 * this.currentDeskNum}%)`;
        };

        switch (orientation) {
          case "right":
            if (this.currentDeskNum < this.desks.length) {
              this.currentDeskNum++;
              transform();
            }
            break;
          case "left":
            transform();
            if (this.currentDeskNum > 0) {
              this.currentDeskNum--;
              transform();
            }
            break;
          default:
            console.log("wtf");
        }
      },
      intentDiscardDrag($event, orientation) {
        console.log("撤出，放弃切换桌面", $event.target);
        // 放弃切换桌面，把背景模糊颜色消除
        let shiftDOM = $event.target;
        shiftDOM.style.backgroundImage = "";
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
          return "APP文件夹";
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
  width: 45rem;
  height: 45rem;
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
  overflow-x: hidden;
}
.ndg-content-border {
  /* border: 1px solid white; */
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 5%;
  box-shadow: 1px 1px 5px 1px rgb(0 0 0 / 60%);
  overflow-x: hidden;
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
  transform: translateX(0%);
}
.ndg-box-group {
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
  font-size: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  /* align-self: flex-end; */
  /* position: absolute; */
  bottom: 0rem;
  color: whitesmoke;
  font-weight: 600;
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
  0%,
  100% {
  }
}
</style>
<!-- 切屏区域css样式 -->
<style scoped>
.ndg-shift {
  /* border: 1px solid red; */
  /* 没有进入拖拽状态的时候放在desktop的下面 */
  /* 进入拖拽状态的时候增加z-index到3 */
  z-index: 0;
  /* background-color: aqua; */
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
<!-- 模态框css样式 -->
<style scoped>
.ndg-modal {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-items: auto;
  /* 以下css属性都要被动态class重置 */
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
  opacity: 0;
}
.ndg-modal-show {
  animation: showModal 0.5s linear fill;
  z-index: 3;
  opacity: 1;
  background-color: rgb(146 148 248 / 10%);
  top: 50%;
  left: 50%;
  width: 30%;
  height: 65%;
  position: fixed;
  transform: translateX(-50%) translateY(-50%);
}
.ngd-modal-header {
  flex-grow: 2;
}
.ngd-modal-content {
  flex-grow: 10;
}
.ngd-modal-footer {
  flex-grow: 1;
}
</style>y