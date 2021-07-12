<template>
  <div class="ndg">
    <!-- 上下左右固定的盒子，拖入就会发生桌面位移，isDragging表示主界面的盒子拖动了，这些四周的固定盒子才允许被拖入 -->
    <shift-zone orientation="left" :flowOver="isDragging" @switchUnit="switchUnit" :size="3"></shift-zone>
    <shift-zone orientation="right" :flowOver="isDragging" @switchUnit="switchUnit" :size="3"></shift-zone>
    <!-- 不要用高斯模糊 否则动画会卡顿 'filter': modal.show? 'blur(4px)':'blur(0px)' -->
    <div class="ndg-background" :style="{'width': deskWidth,'transition': `${switchDeskTime}s all ease-in-out`}" @mousedown="mousedown($event)"
      @mousemove="mousemove($event)">
      <!-- 多个桌面 -->
      <template v-for="(desk, i) in desks">
        <!-- // TODO: 拖入桌面的情况 要重新考虑，判断剩余桌面空间和剩余的方格数 -->
        <div class="ndg-desktop" :key="desk.id" :id="desk.id" @dragover="dragOverContainer($event)">
          <transition-group class="ndg-container" :data-order="i" name="ndg-outer-shift" :duration="switchDuration" tag="div">
            <template v-for="(box, j) in desk.boxes">
              <div :style="[gridSize]" class="ndg-outer" :key="box.id" @dragover="handleDragover($event)" @drop="handleDrop($event,i,j)">
                <div v-show="!toggleBox(i,j)" :style="[boxSize]" class="ndg-content-border"
                  :class="{'shakeAnime':shakeAnimeFlag,'ndg-box-covered': box.covered}" :key="box.id" :id="box.id" :name="box.name" :data-order="j"
                  draggable="true" @resize="handleResize($event)" @drag="appBoxDrag" @dragenter="handleDragEnter($event,i,j)"
                  @dragleave="handleDragLeave($event,i,j)" @dragstart="boxStartDrag($event,i,j)" @dblclick="showModal($event, i,j)"
                  @touchstart="touchstart" @touchend="touchend" @touchmove="touchmove">
                  <Box v-model="desk.boxes[j]" :multipleSize="4" :singleSize="12" :gridLayout="desk.boxes[j].length >1 || box.covered"></Box>
                </div>
                <div class="ndg-desc" style="animation:none" v-show="!toggleBox(i,j)">{{box.name | resolveAppName}}</div> <!-- {{box.name}}-->
              </div>
            </template>
          </transition-group>
        </div>
      </template>
    </div>
    <!-- 文件夹的模态框，要在确定了的情况下加以渲染，即同时满足当下的定位和双击事件-->
    <BoxModal class="modal-show" v-model="desks[modal.index.desk].boxes[modal.index.box]" :modalInfo="modal" ref="modal">
    </BoxModal>
    <DockBar v-model="dockApps"></DockBar>
  </div>
</template>

<script>
  // TODO: 还要做的事情有很多：模态框；通过悬停时间长短，决定是否放入还是换位；换位/并入的 动画 要做出来；
  // 并入，模态框拽出app，并入盒子，模态框消失在视野中，模糊度恢复到blur(0px);
  // TODO: 启用拖拽模式的时候，outerBox如果内部已经有9倍的盒子，就要让出DOM空间，给app放入，这样显得顺理成章，流畅；
  // ondragstart -> ondrag -> ondragenter -> ondragover -> ondragleave -> ondragend -> ondrop
  import { CONTAINER, CONTENT_BORDER, APP, DELAY, DESKTOP } from "./common.js";
  import MyIcon from "./MyIcon.vue";
  import ShiftZone from "./ShiftZone.vue";
  import BoxModal from "./modal/BoxModal.vue";
  import Box from "./Box.vue";
  import initMixin from "./mixins/initMixin.js";
  import DockBar from "./DockBar.vue";
  export default {
    name: "nested-drag-grid",
    components: {
      MyIcon: MyIcon,
      BoxModal: BoxModal,
      Box: Box,
      ShiftZone: ShiftZone,
      DockBar: DockBar
    },
    mixins: [initMixin],
    mounted() {
      // 定位，格式化，初始化
      setTimeout(() => {
        this.square();
        this.$forceUpdate();
      }, 300);
      window.addEventListener("resize", $event => {
        // 防抖 100ms 延时执行
        if (this.resizeTimer) {
          clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(() => {
          console.log("resize...");
          this.locateDOM(true);
          this.square();
          this.portrait = window.innerHeight > window.innerWidth;
        }, 100);
      });
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
    props: {
      layout: {
        type: Object,
        default: () => {
          return {
            col: 5,
            row: 4
          };
        }
      },
      // 悬停判定时间上限
      suspendJudgeLimit: {
        type: Number,
        default: 100
      },
      dragIntoTimeLimit: {
        type: Number,
        default: 450
      },
      boxInitSize: {
        type: Object,
        default: () => {
          return {
            width: "80%",
            height: "80%"
          };
        }
      },
      switchDuration: {
        type: Number,
        default: 200
      },
      // 判定区域伸缩
      threshold: {
        type: Object,
        default: () => {
          return {
            horizontal: 1,
            vertical: 1
          };
        }
      },
      throttleTime: {
        type: Number,
        default: 20
      }
    },
    data() {
      return {
        dockApps: {
          usually: [],
          running: []
        },
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
        enableDrag: false,
        // 正在切换桌面
        deskSwitching: false,
        // box之间拖拽跨过-节流计时器
        boxDOTimer: 0,
        // desk之间拖拽跨入
        deskDOTimer: 0,
        // 重置尺寸计时器
        resizeTimer: {},
        // 鼠标移动计时器
        mouseTimer: true,
        mouse: {
          x: 0,
          y: 0,
          toMove: false,
          orientation: {
            hor: "",
            vet: ""
          }
        },
        // 方格尺寸
        gridSize: {
          "--gw": 100 / this.layout.col + "%",
          "--gh": 100 / this.layout.row + "%"
        },
        boxSize: {
          "--boxinitWidth": this.boxInitSize.width,
          "--boxinitHeight": this.boxInitSize.height
        },
        // 设备摆放方向 默认 landscape
        // orientation:  'portrait'
        portrait: false
      };
    },
    computed: {
      // 拖拽模式下的动画开关
      shakeAnimeFlag() {
        return this.enableDrag;
      }
    },
    methods: {
      outerMove($event) {
        console.log("外部box dom切换", $event);
      },
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
      appBoxDrag($event) {
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
      },
      boxStartDrag($event, deskIndex, boxIndex) {
        this.isDragging = true;
        console.log("%c开始拖拽", "color:blue", deskIndex, boxIndex);
        let xpath = $event.path;
        // 获取下标
        this.draggingDom.desk.index = deskIndex;
        this.draggingDom.box.index = boxIndex;
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
      dragOverContainer($event) {
        const throttleTime = this.throttleTime;
        // 节流100ms执行一次
        if (Date.now() - this.deskDOTimer < throttleTime || !this.isDragging) {
          return;
        }
        // 新一轮计时，重新获取目前时间
        this.deskDOTimer = Date.now();
        setTimeout(() => {
          // console.log("dragOverContainer------");

          let rect1 = this.desks[this.currentDeskNo].restSpace.rect1;
          let rect2 = this.desks[this.currentDeskNo].restSpace.rect2;
          // console.log(rect1, rect2);
          // 判断是否包含在剩余空间（非BOX的container）范围内？
          let includeFlag = rectRect => {
            return (
              rectRect.left < $event.clientX &&
              rectRect.top < $event.clientY &&
              rectRect.right > $event.clientX &&
              rectRect.bottom > $event.clientY
            );
          };
          if (rect1) {
            if (includeFlag(rect1)) {
              console.log("进入剩余区域1");
            }
          }
          if (rect2) {
            if (includeFlag(rect2)) {
              console.log("进入剩余区域2");
            }
          }
          // this.showEvent($event);
        }, throttleTime);
      },
      // 处理动画 N*M宫格
      // TODO: 单个APP拖入集合，判断，集合拖向单个仅仅是置换；
      handleDragover($event) {
        $event.preventDefault();
        // 节流100ms执行一次
        const throttleTime = this.throttleTime;
        if (Date.now() - this.boxDOTimer < throttleTime || !this.isDragging) {
          return;
        }
        // 新一轮计时，重新获取目前时间
        this.boxDOTimer = Date.now();
        setTimeout(() => {
          // 从draggingDOM的原始位置为参照物，判断鼠标移动方向
          this.deterMouseMove($event);
          // 判定是否在rect范围之内
          let judgeFlag = rect => {
            return (
              rect.left < $event.clientX &&
              rect.top < $event.clientY &&
              rect.right > $event.clientX &&
              rect.bottom > $event.clientY
            );
          };
          let deskIndex = this.draggingDom.desk.index;
          let boxIndex = this.draggingDom.box.index;
          // 循环当前所有的box的坐标
          this.desks[this.currentDeskNo].boxes.forEach((box, bid) => {
            let innerDomRect = box.DOMRect;
            let outerDomRect = box.outerDOMRect;
            // 自我覆盖标志（自我==被拖拽的BOX)
            let selfCoverFlag =
              deskIndex == this.currentDeskNo && boxIndex == bid;
            // 判断是否包含在BOX的矩形范围内？
            let innerIncludeFlag = judgeFlag(innerDomRect);
            // 判断是否包含在OUTER-BOX的矩形范围内
            let outerIncludeFlag = judgeFlag(outerDomRect);
            // 重置某个桌面除了bid的其他BOX的cover以及悬停时长
            let recoverOtherBox = (did, bid) => {
              this.desks[did].boxes.forEach((item, index) => {
                if (index != bid) {
                  item.covered = false;
                  item.innerSuspendTime = 0;
                  item.outerSuspendTime = 0;
                }
              });
            };
            if (selfCoverFlag && (outerIncludeFlag || innerIncludeFlag)) {
              recoverOtherBox(this.currentDeskNo, bid);
              // console.log("回到当前被拖拽的box");
            }
            // 在OUTER-BOX的矩形范围内，并且在content-border外部？
            if (outerIncludeFlag && !innerIncludeFlag && !selfCoverFlag) {
              recoverOtherBox(this.currentDeskNo, bid);
              box.outerSuspendTime += throttleTime;
              console.log(
                `第${bid}个outerSuspendTime悬停时间累计为`,
                box.outerSuspendTime
              );
              // 在外部的时间足够，只有交换位置这一选择
              if (box.outerSuspendTime > this.suspendJudgeLimit) {
                this.boxAction(this.currentDeskNo, bid, "switch");
              }
              // $event.stopPropagation();
              return;
            }

            // 定位到BOX的矩形范围内，得到具体的BOX下标，另外不能覆盖自己，不用和自己交换位子
            if (innerIncludeFlag && !selfCoverFlag) {
              recoverOtherBox(this.currentDeskNo, bid);
              console.log("已定位：", "桌面", this.currentDeskNo, "盒子", bid);
              // 追加悬停时间
              box.innerSuspendTime += throttleTime;
              // 修改覆盖标识 默认100ms判定
              let directDropFlag =
                box.innerSuspendTime > this.suspendJudgeLimit &&
                box.innerSuspendTime < this.dragIntoTimeLimit;
              if (directDropFlag) {
                // 被拖拽的是单独的APP
                let isApp =
                  this.desks[deskIndex].boxes[boxIndex].apps.length == 1;
                if (isApp) {
                  // 可以确认正在被拉拽物被覆盖,covered绑定了一部分动画做出相应动画
                  box.covered = true;
                } else {
                  // 被拖拽的是APP集合
                }
                // TODO: 加入内部盒子
              }
              // 默认50ms判定
              if (box.innerSuspendTime > this.dragIntoTimeLimit) {
                // 打开模块
                if (!this.modal.show) {
                  this.showModal($event, this.currentDeskNo, bid);
                }
              }

              // 显示悬停时间
              console.log(
                `第${bid}个innerSuspendTime悬停时间累计为`,
                box.innerSuspendTime,
                "覆盖？",
                box.covered
              );
              return;
              // 禁止传播
              // $event.stopPropagation();
            }
          });
          this.showEvent($event);
        }, throttleTime);
      },
      // 延时一小段间隙，处理悬停时间
      handleDrop($event, deskIndex, boxIndex) {
        $event.preventDefault();
        // 节流100ms执行一次
        const delayTime = 100;
        let box = this.desks[deskIndex].boxes[boxIndex];
        // 时间在 suspendJudgeLimit和dragIntoTimeLimit区间之中
        let dragIntoFlag =
          box.innerSuspendTime > this.suspendJudgeLimit &&
          box.innerSuspendTime < this.dragIntoTimeLimit;
        console.log(dragIntoFlag, box.innerSuspendTime);
        if (dragIntoFlag) {
          this.boxAction(deskIndex, boxIndex, "dragInto");
        }
        setTimeout(() => {
          // drop事件发生，悬停时间，全部归零
          this.desks[this.currentDeskNo].boxes.forEach((item, index) => {
            item.innerSuspendTime = 0;
            item.outerSuspendTime = 0;
            item.covered = false;
          });
          console.log("已经清空悬停时间");
        }, delayTime);
      },
      // 让 draggingDOM和tragetBox交换位子
      // targetDesktop 目标桌面序号 targetBox目标盒子序号
      boxAction(targetDesktop, targetBox, actionType) {
        let boxIndex = this.draggingDom.box.index;
        let deskIndex = this.draggingDom.desk.index;
        // 置换后腰修改draggingDom所在的定位
        if (actionType == "switch") {
          // 同一个桌面
          if (targetDesktop == this.draggingDom.desk.index) {
            // 交换
            this.desks[targetDesktop].boxes = this.swapArray(
              this.desks[targetDesktop].boxes,
              boxIndex,
              targetBox
            );
            // }
            this.draggingDom.desk.index = targetDesktop;
            this.draggingDom.box.index = targetBox;
            this.locateDOM(true);
          } else {
            // 切换到其他桌面
            let origin = this.desks[deskIndex].boxes[boxIndex];
            let replaced = this.desks[targetDesktop].boxes[boxIndex];
            // 删除，加入
            this.desks[targetDesktop].boxes[targetBox] = origin;
            this.desks[deskIndex].boxes[boxIndex] = replaced;
            // TODO: 未完待续
            console.log(origin, replaced);

            this.draggingDom.desk.index = targetDesktop;
            this.draggingDom.box.index = targetBox;
            this.locateDOM(true);
          }
        } else if (actionType == "dragInto") {
          // 拖入其中
          let box = this.desks[deskIndex].boxes.slice(boxIndex, boxIndex + 1)[0];
          let draggedApp = {
            id: box.apps[0].id,
            name: box.apps[0].name
          };
          this.desks[targetDesktop].boxes[targetBox].apps.push(draggedApp);
          // 删掉整个盒子
          this.desks[deskIndex].boxes.splice(boxIndex, 1)[0];
          // setTimeout(() => {
          //   this.locateDOM(true);
          // }, 300);
        }
      },
      handleResize($event) {
        //
      },
      // 处理拖入 suspendTime计时判断，悬停位置最后的offset 相关动画，行为（并入）
      handleDragEnter($event, deskIndex, boxIndex) {
        //
      },
      // 处理拖出
      handleDragLeave($event, deskIndex, boxIndex) {
        //
      },
      // 决定鼠标动向
      deterMouseMove($event) {
        let changeX = $event.clientX - this.mouse.x;
        let changeY = $event.clientY - this.mouse.y;

        if (changeX > 0) {
          this.mouse.orientation.hor = "right";
        } else if (changeX < 0) {
          this.mouse.orientation.hor = "left";
        }
        if (changeY < 0) {
          this.mouse.orientation.vet = "up";
        } else if (changeY > 0) {
          this.mouse.orientation.vet = "down";
        }
        // console.log(
        //   "和初始位置作比较",
        //   changeX,
        //   changeY,
        //   this.mouse.orientation.hor,
        //   this.mouse.orientation.vet
        // );
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
      },
      // 鼠标按下定位好点击地址
      mousedown($event) {
        this.mouse.x = $event.clientX;
        this.mouse.y = $event.clientY;
      },
      // 鼠标移动 节流
      mousemove($event) {
        if (!this.mouseTimer) {
          return;
        }
        this.mouseTimer = false;
        setTimeout(() => {
          this.mouseTimer = true;
        }, 200);
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
  transition: all 0.5s ease-in-out;
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
  margin: 1vh auto 0 auto;
  /* margin: 0 auto; */
  display: flex;
  display: -webkit-flex;
  display: -ms-flexbox;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: flex-start;
  align-content: flex-start;
  width: 100vw;
  height: 80vmin;
}
/* ndg 大宫格布局 */
.ndg-outer {
  display: flex;
  display: -webkit-flex;
  flex-direction: column;
  flex-wrap: no-wrap;
  justify-content: space-around;
  flex-grow: 1;
  /* 限制宽度 */
  min-width: var(--gw);
  max-width: var(--gw);
  /* 限制高度 */
  max-height: var(--gh);
  min-height: var(--gh);
  box-sizing: border-box;
  border-radius: 10%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease-in-out;
}
.ndg-outer-shift {
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
/* BOX相互置换的时候追加样式 */
.ndg-outer-shift-move .ndg-content-border {
  border: 1px solid white;
}
.ndg-content-border {
  position: relative;
  margin: 0 auto;
  width: var(--boxinitWidth);
  height: var(--boxinitHeight);
  border-radius: 5%;
  box-shadow: 1px 1px 5px 1px rgb(0 0 0 / 60%);
  overflow: hidden;
  transition: transform 0.25s ease-in-out;
}
.ndg-desc {
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  bottom: 0rem;
  color: whitesmoke;
  font-weight: 400;
  align-self: center;
}

/* 实现抖动 */
@keyframes shakeAnime {
  0% {
    transform: scale(1) rotate(0);
  }

  25% {
    transform: scale(1) rotate(-0.5deg);
  }

  50% {
    transform: scale(1) rotate(0.5deg);
  }

  75% {
    transform: scale(1) rotate(-0.5deg);
  }

  100% {
    transform: scale(1) rotate(0);
  }
}
.shakeAnime {
  animation: shakeAnime 0.5s both infinite;
}
/* 被覆盖，放大BOX */
.ndg-box-covered {
  transform: scale(1.1);
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
  animation: showModal 1s both;
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