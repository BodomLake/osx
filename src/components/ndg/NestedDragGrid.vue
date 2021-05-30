<template>
  <div class="ndg">
    <!-- 上下左右固定的盒子，拖入就会发生桌面位移，isDragging表示主界面的盒子拖动了，这些四周的固定盒子才允许被拖入 -->
    <div class="ndg-shift-top ndg-shift" :style="{'z-index':isDragging?'3':'0'}" :draggable="isDragging" @mouseenter="onMouseEnter($event,'top')"
      @mouseout="onMouseOut($event,'top')" @dragenter="intentToDragOver($event,'top')" @dragleave="intentDiscardDrag($event,'top')"></div>
    <div class="ndg-shift-left ndg-shift" :style="{'z-index':isDragging?'3':'0'}" :draggable="isDragging" @mouseenter="onMouseEnter($event,'left')"
      @mouseout="onMouseOut($event,'left')" @dragenter="intentToDragOver($event,'left')" @dragleave="intentDiscardDrag($event,'right')"></div>
    <div class="ndg-shift-right ndg-shift" :style="{'z-index':isDragging?'3':'0'}" :draggable="isDragging" @mouseenter="onMouseEnter($event,'right')"
      @mouseout="onMouseOut($event,'right')" @dragenter="intentToDragOver($event,'right')" @dragleave="intentDiscardDrag($event,'right')"></div>
    <div class="ndg-shift-bottom ndg-shift" :style="{'z-index':isDragging?'3':'0'}" :draggable="isDragging"
      @mouseenter="onMouseEnter($event,'bottom')" @mouseout="onMouseOut($event,'bottom')" @dragenter="intentToDragOver($event,'bottom')"
      @dragleave="intentDiscardDrag($event,'bottom')"></div>

    <div class="ndg-background">
      <div class="ndg-desktop">
        <!-- 多个桌面 -->
        <template v-for="(desk, i) in desks">
          <div class="ndg-container" :key="i" :id="desk.id" @mousedown="onMouseDown($event, i)">
            <!-- 多个外部盒子 -->
            <template v-for="(outerItem, j) in desk.boxes">
              <div class="ndg-outer" :key="j" :id="outerItem.id" :name="outerItem.name" @dragover="outerDragover" @drag="outerOnDrag"
                @drop="outerOnDrop" draggable="true" @dragstart="outerDragStart($event)" @click="showModal(i)" @mousedown="onMouseDown($event, i, j)"
                :class="{'shakeAnime':shakeAnime}">
                <!-- 多个App -->
                <div class="ndg-content-border">
                  <!-- 属于文件夹，九宫格模式 -->
                  <template v-for="(innerItem, k) in outerItem.innerBoxes">
                    <div class="ndg-inner" :key="k" :name="innerItem.name" @dragover="innerDragover" @drag="innerOnDrag" @drop="innerOnDrop"
                      :id="innerItem.id" :draggable="enableDrag" @dragstart="innerDragStart($event)" @mousedown="onMouseDown($event, i, j, k )">
                      <my-icon :className="innerItem.name" v-if="innerItem.name!==''" :singleBox="outerItem.innerBoxes.length == 1"></my-icon>
                    </div>
                  </template>
                  <!-- 如果不属于文件夹，也是innerBox长度为0 -->
                  <template v-if="outerItem.innerBoxes.length == 0">
                    <my-icon :className="outerItem.name" :singleBox="true"></my-icon>
                  </template>
                </div>
                <div class="ndg-desc" style="animation:none">文件集合</div> <!-- {{outerItem.name}}-->
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  // 光晕效果
  // box-shadow: 1px 1px 25px 10px rgb(146 148 248 / 40%);
  // ondragstart -> ondrag -> ondragenter -> ondragover -> ondragleave -> ondragend -> ondrop
  const PREFIX = "ndg-";
  const CONTAINER = PREFIX + "container";
  const OUTER = PREFIX + "outer";
  const INNER = PREFIX + "inner";
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
    data() {
      return {
        index: {
          deskIndex: 0,
          boxIndex: 0,
          appIndex: 0
        },
        isDragging: false,
        draggingDom: {},
        replacedDom: {},
        shakeAnime: false,
        // 启用内部拖拽到外部？
        enableDrag: false
      };
    },
    methods: {
      // 定位可视界面中，每个（内外）box的x,y坐标
      innerOnDrag($event) {
        // console.log("内部", $event);
      },
      outerOnDrag($event) {
        // console.log("外部", $event);
      },
      innerDragStart($event, appIndex) {
        $event.stopPropagation();
        // 确定拖拽的是哪个dom
        this.isDragging = true;
        console.log("%c开始拖拽", "color:red");
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.draggingDom);
      },
      outerDragStart($event, boxIndex) {
        this.isDragging = true;
        console.log("%c开始拖拽", "color:blue");
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.draggingDom);
      },
      innerOnDrop($event) {
        // 不要让内部拖拽事件冒泡成为外部拖拽事件
        $event.stopPropagation();
        // 打印出事件详情
        console.log("%c内部drop in\n", "color:red", $event);
        // 组内切换位置，位置互调
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.replacedDom);
        this.isDragging = false;
      },
      outerOnDrop($event) {
        // 打印出事件详情
        console.log("%c外部drop in \n", "color:blue", $event);
        // 组见切换位置，位置互调
        let xpath = $event.path;
        this.locateDraggingDOM(xpath, this.replacedDom);
        this.isDragging = false;
      },
      outerDragover($event) {
        // console.log("外部dragover", $event);
        // $event.stopPropagation();
        $event.preventDefault();
      },
      innerDragover($event) {
        // console.log("内部dragover", $event);
        // $event.stopPropagation();
        $event.preventDefault();
      },
      // 定位正在被拖拽的盒子是哪一个？
      locateDraggingDOM(xpath, dom) {
        for (let i = 0; i < xpath.length; i++) {
          // console.log(xpath[i].className);
          if (xpath[i].className && xpath[i].tagName == "DIV") {
            if (xpath[i].className.indexOf(INNER) != -1) {
              dom = xpath[i];
              console.log("inner确定被拖拽的DOM", dom);
              break;
            }
            if (xpath[i].className.indexOf(OUTER) != -1) {
              dom = xpath[i];
              console.log("outer确定被拖拽的DOM", dom);
              break;
            }
          }
        }
      },
      showModal(index) {},
      // TODO
      findIndexById(arr, id) {},
      // 鼠标按下，确定dom的坐标；
      onMouseDown($event, deskIndex, boxIndex, appIndex) {
        // 确定当前桌面的下标
        // return;
        let target = $event.target;
        $event.stopPropagation();
        console.log("鼠标左键按下", target, deskIndex, boxIndex, appIndex);
        // 因为冒泡事件被中断，所以一步到位
        this.index.deskIndex = this.isNumber(deskIndex) ? deskIndex : 0;
        this.index.boxIndex = this.isNumber(boxIndex) ? boxIndex : 0;
        this.index.appIndex = this.isNumber(appIndex) ? appIndex : 0;

        // console.log({
        //   path: $event.path,
        //   target: $event.target,
        //   srcElement: $event.srcElement,
        //   toElement: $event.toElement,
        //   screenX: $event.screenX,
        //   screenY: $event.screenY,
        //   clientX: $event.clientX,
        //   clientY: $event.clientY
        // });
      },
      // 左右方向：进行一段延时之后 滑动桌面
      // 上下方向：方便用户上下滚动 scrollToTop scrollToBottom
      onMouseEnter($event, orientation) {
        // console.log($event,orientation);
        // let shiftDOM = $event.target;
        // shiftDOM.style.backgroundImage = `linear-gradient(to ${orientation}, rgb(146 148 248 / 10%), rgb(255 255 255 / 50%))`;
      },
      onMouseOut($event, orientation) {
        // console.log($event,orientation);
        // let shiftDOM = $event.target;
        // shiftDOM.style.backgroundImage = "";
      },
      intentToDragOver($event, orientation) {
        console.log("拖入，准备切换桌面", $event.target);
        // 判断 orientation (left right up down)决定主界面平移方向  scrollTo()来垂直拉动 水平移动

        // 垂直移动 clientHeight减去DIV.ndg-background的的scrollHeight是垂直活动的空间，增减scrollTop实现偏移

        // 水平移动 .ndg-background的DIV的scrollWidth属性的 1/n 来计算每次平移的偏移量，增减scrollLeft实现偏移
        // 或者 clientWidth减去DIV.ndg-background的的scrollWidth作为水平活动的空间，增减scrollLeft实现偏移
        // 放弃 translateX() 和 translateY()         // 还要加上模糊色效果；

        let shiftDOM = $event.target;
        shiftDOM.style.backgroundImage = `linear-gradient(to ${orientation}, rgb(146 148 248 / 10%), rgb(255 255 255 / 50%))`;
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
      isNotEmptArr: function(arr) {
        if (arr.length && arr.length > 0) {
          return true;
        }
        return false;
      },
      f2: function(value) {
        return "内" + value;
      }
    }
  };
</script>
<style scoped>
.ndg {
  position: fixed;
  top: 0%;
  left: 0%;
  width: 100%;
  /* top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%); */
}
/* 主题背景，大背景，大布局 */
.ndg-background {
  padding: 0;
  overflow: scroll;
  /* position: relative; */
  /* top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%); */
  margin: 0 auto;
  width: 100vw;
  max-height: 100vh;
  background-image: url("../../assets/Wallpaper.jpg");
}
/* 当前桌面 */
.ndg-desktop {
  height: 100%;
  position: relative;
  display: flex;
  /* flex-basis: 45rem; */
  /* flex-direction: row; */
  /* 有n个桌面就是 n个 100% */
  width: 300%;
  /* 偏移量的改变就是移动桌面 每次移动X = 100/n */
  transform: translateX(0%);
}

/* ndg容器布局 */
.ndg-container {
  display: flex;
  display: -webkit-flex;
  display: -ms-flexbox;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: flex-start;
  align-content: stretch;
  width: 100%;
  height: 60rem;
  padding: 3rem 16rem;
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
}
.ndg-content-border {
  border: 1px solid white;
  box-shadow: 10px 10px 20px rgb(0 0 0 / 50%);
  /* position: absolute; */
  width: 95%;
  height: 95%;
  align-self: center;
  /* transform: translateY(-5%); */
  border-radius: 10%;
  display: flex;
  flex-direction: row;
  flex-grow: 10;
  flex-wrap: wrap;
  align-content: flex-start;
}
.ndg-content-border::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 10%;
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
  box-shadow: 0 5px 5px rgb(0 0 0 / 50%);
}

/* 九宫格三等分 3*3 */
.ndg-inner {
  box-sizing: border-box;
  flex-grow: 1;
  /* background-color: beige; */
  border-radius: 2%;
  cursor: pointer;
  position: relative;
  /* border: 1px solid red; */
  /* 限制宽度 */
  min-width: calc(calc(100% / 3));
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
</style>
