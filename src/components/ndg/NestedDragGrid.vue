<template>
  <div class="ndg">
    <!-- 上下左右固定的盒子，拖入就会发生桌面位移，isDragging表示主界面的盒子拖动了，这些四周的固定盒子才允许被拖入 -->
    <shift-zone orientation="left" :flowOver="isDragging" @switchUnit="switchUnit" :size="3"></shift-zone>
    <shift-zone orientation="right" :flowOver="isDragging" @switchUnit="switchUnit" :size="3"></shift-zone>
    <!-- 不要用高斯模糊 否则动画会卡顿 'filter': modal.show? 'blur(4px)':'blur(0px)' -->
    <div class="ndg-background"
         :style="{'width': deskWidth,'transition': `all ${switchDeskTimeCost}ms ease-in-out`, 'transform': deskOffset}"
         @mousedown="mousedown($event)" @mousemove="mousemove($event)">
      <!-- 多个桌面 -->
      <template v-for="(desk, i) in desks">
        <div class="ndg-desktop" :key="desk.id" :id="desk.id">
          <transition-group class="ndg-container" name="ndg-outer-shift" :duration="switchDuration" tag="div"
                            @drop="deskDrop($event, i)" @dragover="containerDragOver($event, i)" :draggable="isDragging">
            <template v-for="(box, j) in desk.boxes">
              <div class="ndg-outer" :style="[gridSize]" :key="box.id" @dragover="outerDargOver($event, i, j)"
                   @dragend="outerDargEnd($event,i,j)" @click="($event)=>{$event.stopPropagation()}"
                   @mouseenter="ome($event, i, j)"
                   @mouseleave="oml($event, i ,j)">
                <div class="ndg-content-border" :class="{'ndg-box-covered': box.covered}"
                     :style="[boxSize, checkedBOX(i,j), filledBOX(i,j)]" :key="box.id" :draggable="enableDrag"
                     @drop="boxDrop($event,i,j)"
                     @dblclick="showModal($event, i,j)" @dragstart="boxStartDrag($event,i,j)"
                     @drag="boxDrag($event, i, j)" @dragenter="boxDragEnter($event,i,j)"
                     @dragleave="boxDragLeave($event,i,j)"
                     @dragend="boxDragEnd($event,i,j)" @touchstart="touchstart" @touchend="touchend"
                     @touchmove="touchmove">
                  <Box v-model="desk.boxes[j]" :id="box.id" :name="box.name" :enableDrag="enableDrag"></Box>
                </div>
                <div class="ndg-desc" style="animation:none" :style="[checkedBOX(i,j)]">
                  {{ box.name | resolveAppName }}
                </div>
              </div>
            </template>
          </transition-group>
        </div>
      </template>
    </div>
    <!-- 文件夹的模态框，要在确定了的情况下加以渲染，即同时满足当下的定位和双击事件-->
    <BoxModal v-model="checkedModal" :portrait="portrait" :enableDrag="enableDrag" ref="modal"></BoxModal>
    <Indicator v-model="desks" @scrollToDestDesk="switchUnit" :displayNo="currentDeskNo"></Indicator>
    <DockBar v-model="dockApps"></DockBar>
    <canvas id="canvas" style="display:none"></canvas>
  </div>
</template>

<script>
// TODO: 还要做的事情有很多：模态框；通过悬停时间长短，决定是否放入还是换位；换位/并入的 动画 要做出来；
// 并入，模态框拽出app，并入盒子，模态框消失在视野中，模糊度恢复到blur(0px);
// TODO: 启用拖拽模式的时候，outerBox如果内部已经有9倍的盒子，就要让出DOM空间，给app放入，这样显得顺理成章，流畅；
// ondragstart -> ondrag -> ondragenter -> ondragover -> ondragleave -> ondragend -> ondrop
import {BACKGROUND, DESKTOP, CONTAINER} from "./common.js";
import MyIcon from "./MyIcon.vue";
import ShiftZone from "./ShiftZone.vue";
import BoxModal from "./modal/BoxModal.vue";
import Box from "./Box.vue";
import initMixin from "./mixins/initMixin.js";
import DockBar from "./DockBar.vue";
import Indicator from "./Indicator.vue";
import {v4 as uuidv4} from "uuid";
import {desks} from "@/components/ndg/app";

export default {
  name: "nested-drag-grid",
  components: {
    MyIcon: MyIcon,
    BoxModal: BoxModal,
    Box: Box,
    ShiftZone: ShiftZone,
    DockBar: DockBar,
    Indicator: Indicator
  },
  mixins: [initMixin],
  mounted() {
    // 定位，格式化，初始化
    this.initBOX();
    setTimeout(() => {
      // this.square();
    }, 300)
    this.$forceUpdate();

    window.addEventListener("resize", $event => {
      // 防抖 100ms 延时执行
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = window.setTimeout(() => {
        console.log("全局 resize...");
        this.locateBOX();
        // this.square();
        this.portrait = window.innerHeight > window.innerWidth;
      }, 100);
    });
    window.addEventListener("keydown", $event => {
      let keyCode = $event.key;
      // debugger;
      switch (keyCode) {
        case "ArrowLeft":
          this.switchUnit(-1);
          $event.preventDefault();
          break;
        case "ArrowRight":
          this.switchUnit(1);
          $event.preventDefault();
          break;
        case "ArrowUp":
          break;
        case "ArrowDown":
          break;
        case "Escape":
          if (this.$refs["modal"].showModal) this.$refs["modal"].toggleModal();
        default:
      }
    });
    window.addEventListener("click", $event => {
      // 需要获取modal的主体范围 判断是否在其中？决定是否关闭
      if (this.$refs["modal"].showModal) this.$refs["modal"].toggleModal();
    });
    window.addEventListener("touchend", $event => {
      if (this.$refs["modal"].showModal) this.$refs["modal"].toggleModal();
    });
    // 初始化长按状态
    window.addEventListener("mousedown", $event => {
      this.longPress.timer = Date.now();
      this.longPress.moveFlag = false;
      this.longPress.flag = false;
      this.longPress.startPos.x = $event.clientX;
      this.longPress.startPos.y = $event.clientY;
    });
    // 判断是否进入长按，长按就意味着要使用拖拽模式
    window.addEventListener("mouseup", $event => {
      this.longPress.endPos.x = $event.clientX;
      this.longPress.endPos.y = $event.clientY;
      let delta = Date.now() - this.longPress.timer;
      let offsetX = Math.abs(
        this.longPress.endPos.x - this.longPress.startPos.x
      );
      let offsetY = Math.abs(
        this.longPress.endPos.y - this.longPress.startPos.y
      );
      // 只要移动距离没有超出5px的原型就算是没有移动，可以计入静止的长按
      this.longPress.moveFlag = offsetX > 5 && offsetY > 5;
      // 时间长度大于1000毫秒，并且鼠标中途没有移动，并且没有处于长按模式
      if (
        delta > 500 &&
        this.longPress.moveFlag == false &&
        this.longPress.flag == false
      ) {
        this.longPress.flag = true;
        console.log(delta / 1000, "秒", "触发长按", this.longPress.flag);
        // 启用拉拽模式
        this.enableDrag = true;
      } else if (delta < 500 && delta > 200) {
        console.log(delta / 1000, "秒", "不算触发长按");
      } else {
        // console.log(this.longPress.moveFlag ? "已经移动了" : "鼠标未移动");
      }
    });
    // 双击退出拉拽模式
    window.addEventListener("dblclick", $event => {
      this.longPress.flag = false;
      this.longPress.moveFlag = false;
      this.isDragging = false;
      this.enableDrag = false;
      this.locateBOX();
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
      default: 200
    },
    // 拖入app集合内的判定时间
    dragIntoTimeLimit: {
      type: Number,
      default: 500
    },
    boxInitRatio: {
      type: Number,
      default: 0.85
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
      default: 50
    }
  },
  data() {
    return {
      dockApps: {
        usually: [],
        running: []
      },
      // 正在拖拽？初始化为否
      isDragging: false,
      // 被拖拽的DOM
      draggingIndex: {
        deskIndex: 0,
        boxIndex: 0
      },
      // 被置换的DOM
      targetIndex: {
        deskIndex: 0,
        boxIndex: 0
      },
      // 模态框的数据
      modal: {
        index: {
          desk: 0,
          box: 0
        }
      },
      // 拖拽跨过桌面了
      crossDesk: false,
      // 启用拖拽？进入拖拽模式，桌面添加一个；BOX全部添加一组，并且滑动到最后一组（displayNo调节到最大）；对应的指示器也要添加一个圆点
      enableDrag: false,
      // 正在切换桌面
      deskSwitching: false,
      // 所有的计时器
      timer: {
        // box之间拖拽跨过-节流计时器
        boxInnerDOTimer: null,
        //  外部拖拽
        boxOuterDOTimer: null,
        // desk之间拖拽跨入
        deskDOTimer: 0,
      },
      // 进入剩余区域追加进行时
      boxAppending: false,
      // 重置尺寸计时器
      resizeTimer: null,
      // 长按情况
      longPress: {
        timer: 0,
        moveFlag: false,
        flag: false,
        startPos: {
          x: 0,
          y: 0
        },
        endPos: {
          x: 0,
          y: 0
        }
      },
      // 鼠标移动计时器
      mouseMoveFlag: true,
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
        "--gw": 100 / this.layout.col + "vw",
        "--gh": 80 / this.layout.row + "vh"
      },
      // 设备摆放方向 默认 landscape 所以是false
      portrait: window.innerHeight > window.innerWidth
    };
  },
  watch: {
    enableDrag: {
      handler: function (enableDrag, oldVal) {
        if (enableDrag) {
          this.enterDragMode();
        } else {
          this.quitDragMode();
        }
      },
      immediate: false
    }
  },
  computed: {
    boxSize: {
      cache: false,
      get() {
        let less = 100 / Math.max(this.layout.row, this.layout.col)
        let unit = this.portrait ? 'vw' : 'vh'
        return {
          "--boxinitWidth": this.boxInitRatio * less + unit,
          "--boxinitHeight": this.boxInitRatio * less + unit
        }
      },
      set() {

      }
    },
    // 把当前的BOX信息传入模态框
    checkedModal: {
      cache: false,
      get() {
        return this.desks[this.modal.index.desk].boxes[this.modal.index.box];
      }
    },
    // 桌面拖拽的时候 被拖拽的BOX
    draggingBOX: {
      cache: false,
      // 不带上 .appGroups[0][0];
      get() {
        return this.desks[this.draggingIndex.deskIndex].boxes[
          this.draggingIndex.boxIndex
          ];
      }
    },
    // 桌面拖拽的时候 目标BOX
    targetBOX: {
      cache: false,
      // 不带上 .appGroups[0][0];
      get() {
        return this.desks[this.targetIndex.deskIndex].boxes[
          this.targetIndex.boxIndex
          ];
      }
    }
  },
  methods: {
    ome($event, deskIndex, boxIndex) {
      let appGroups = this.desks[deskIndex].boxes[boxIndex].appGroups;
      let appCount = this.appCounter(deskIndex, boxIndex)
      let isApp = appGroups.length == 1 && appCount == 1;
      // this.desks[deskIndex].boxes[boxIndex].outerSuspendTime = Date.now();
      if (!this.$refs["modal"].showModal && !isApp) {
        this.modal.index.desk = deskIndex;
        this.modal.index.box = boxIndex;
      }
    },
    oml($event, deskIndex, boxIndex) {
      // 离开就
      // this.desks[deskIndex].boxes[boxIndex].outerSuspendTime = 0;
    },
    outerMove($event) {
      console.log("外部box dom切换", $event);
    },
    // 移动端适配 事件
    touchstart($event) {
      console.log("touchstart", $event);
      $event.preventDefault();
    },
    touchmove($event) {
      console.log("touchmove", $event);
    },
    touchend($event) {
      $event.stopPropagation();
      if (this.$refs["modal"].showModal == false)
        this.$refs["modal"].toggleModal();
      console.log("touchend", $event);
    },
    appGroupOnDrag($event) {
      // console.log("外部", $event);
    },
    appGroupDragStart($event, appIndex) {
      $event.stopPropagation();
      this.isDragging = true;
      console.log("%c开始拖拽", "color:red");
    },
    boxDrag($event, deskIndex, boxIndex) {
      console.log('drag', deskIndex, boxIndex)
    },
    boxStartDrag($event, deskIndex, boxIndex) {
      console.log('drag-start', deskIndex, boxIndex)
      if (this.appCounter(deskIndex, boxIndex) == 0) {
        $event.preventDefault();
        return;
      }
      this.isDragging = true;
      $event.stopPropagation();
      // 获取下标
      this.draggingIndex.deskIndex = deskIndex;
      this.draggingIndex.boxIndex = boxIndex;
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
    // 每个桌面的容器拖拽交互
    containerDragOver($event, deskIndex) {
      // return;
      const throttleTime = this.throttleTime;
      // 节流100ms执行一次
      if (Date.now() - this.timer.deskDOTimer < throttleTime) {
        return;
      }
      this.timer.deskDOTimer = Date.now()
      // 新一轮计时，重新获取目前时间
      window.setTimeout(() => {
        console.log("---containerDragOver---正在拖拽的是", this.draggingIndex.boxIndex);
        let rect1 = this.desks[deskIndex].restSpace.rect1;
        let rect2 = this.desks[deskIndex].restSpace.rect2;

        let includeFlag = rect => {
          if (rect == undefined) {
            return false;
          }
          return (
            rect.left < $event.clientX &&
            rect.top < $event.clientY &&
            rect.right > $event.clientX &&
            rect.bottom > $event.clientY
          );
        };
        if (includeFlag(rect1) || includeFlag(rect2)) {
          console.log("桌面", deskIndex, "进入剩余区域1 、2");
          // 目标桌面
          let desk = this.desks[deskIndex];
          let len = desk.boxes.length
          let storage = window.localStorage;
          storage.setItem('draggedBox', JSON.stringify(desk.boxes.slice(-1)))
          let dragBOX = desk.boxes.splice(this.draggingIndex.boxIndex, 1)[0];
          if (dragBOX != desk.boxes[len - 1]) {
            console.log('加入', dragBOX)
            let insertBox = JSON.parse(storage.getItem('draggedBox'))
            console.log(insertBox)
            this.desks[deskIndex].boxes.push(insertBox);
          }

        }

      }, throttleTime);
    },
    // 处理动画 N*M宫格
    // TODO: 单个APP拖入集合，判断，集合拖向单个仅仅是置换；
    outerDargOver($event, deskIndex, boxIndex) {
      $event.preventDefault();
      this.targetIndex.deskIndex = deskIndex;
      this.targetIndex.boxIndex = boxIndex;
      // 节流100ms执行一次
      const throttleTime = this.throttleTime;
      let throttleFlag = Date.now() - this.timer.boxOuterDOTimer < throttleTime;
      if (throttleFlag) {
        return;
      }
      // 新一轮计时，重新获取目前时间
      this.timer.boxOuterDOTimer = Date.now();
      window.setTimeout(() => {
        // 从draggingIndex的原始位置为参照物，判断鼠标移动方向
        this.deterMouseMove($event);
        let targetDI = this.targetIndex.deskIndex;
        let targetBI = this.targetIndex.boxIndex;
        console.log(
          "定位到",
          this.targetIndex.deskIndex,
          this.targetIndex.boxIndex
        );
        let boxes = this.desks[this.targetIndex.deskIndex].boxes;
        // 判定是否在rect范围之内
        let judgeFlag = rect => {
          return (
            rect.left < $event.clientX &&
            rect.top < $event.clientY &&
            rect.right > $event.clientX &&
            rect.bottom > $event.clientY
          );
        };
        let deskIndex = this.draggingIndex.deskIndex;
        let boxIndex = this.draggingIndex.boxIndex;
        // 循环当前所有的box的坐标
        for (let bid = 0; bid < boxes.length; bid++) {
          let box = boxes[bid];
          let innerDomRect = box.DOMRect;
          let outerDomRect = box.outerDOMRect;

          // 自我覆盖标志（自我==被拖拽的BOX)
          let selfCoverFlag = deskIndex == targetDI && boxIndex == bid;
          // let sideFlag = outerDomRect.left < $event.left && innerDomRect.left > $event.left;
          // 判断是否包含在BOX的矩形范围内？
          let innerIncludeFlag = judgeFlag(innerDomRect);
          // 判断是否包含在OUTER-BOX的矩形范围内
          let outerIncludeFlag = judgeFlag(outerDomRect);

          // 重置某个桌面除了bid的其他BOX的cover以及悬停时长
          if (selfCoverFlag && (outerIncludeFlag || innerIncludeFlag)) {
            // console.log("回到当前被拖拽的box");
            this.recoverOtherBox(targetDI, boxIndex);
            break;
          }

          // 在OUTER-BOX的矩形范围内，并且在content-border外部？
          if (outerIncludeFlag && !innerIncludeFlag && !selfCoverFlag) {
            this.recoverOtherBox(targetDI, bid);
            console.log("已定位：", "桌面", targetDI, "BOX外部", bid);
            box.outerSuspendTime += throttleTime;
            console.log(`第${bid}个外部悬停时间累计为`, box.outerSuspendTime);
            // 在外部的时间足够，只有交换位置这一选择
            if (box.outerSuspendTime > this.suspendJudgeLimit) {
              this.moveBox(targetDI, bid);
            }
            break;
          }

          // 定位到BOX的矩形范围内，得到具体的BOX下标，另外不能覆盖自己，不用和自己交换位子
          if (innerIncludeFlag && !selfCoverFlag) {
            this.recoverOtherBox(targetDI, bid);
            console.log("已定位：", "桌面", targetDI, "BOX内部", bid);
            // 追加悬停时间
            box.innerSuspendTime += throttleTime;
            // 如果目标是占位盒子
            let toBlank = this.appCounter(targetDI, targetBI) == 0;
            // 修改覆盖标识 默认100ms判定 直接放入，不需要打开模态框！
            let directInsertFlag = this.inRegion(box.innerSuspendTime, this.suspendJudgeLimit, this.dragIntoTimeLimit)

            if (toBlank && box.innerSuspendTime > this.suspendJudgeLimit) {
              this.moveBox(targetDI, targetBI);
              break;
            }

            // 考虑直接放入BOX文件夹
            if (directInsertFlag) {
              // 被拖拽的是单独的APP
              let appGroups = this.desks[deskIndex].boxes[boxIndex].appGroups;
              let appCount = this.appCounter(deskIndex, boxIndex)
              // 可以确认正在被拉拽物被覆盖,covered绑定了一部分动画做出相应动画
              if (appGroups.length == 1 && appCount == 1) {
                if (!box.covered) {
                  box.covered = true;
                }
                console.log(`第${bid}：内部悬停时间：`, box.innerSuspendTime);
              } else {
                // 被拖拽的是APP集合, 什么也不发生,还是交换位置 bid就是当前符合坐标要求的BOX的下标
                this.moveBox(targetDI, bid);
              }
              break;
            }
            // 打开模态框，以便放入
            if (box.innerSuspendTime > this.dragIntoTimeLimit) {
              // 不需要scale 放大
              box.covered = false;
              // 如果没有显示模态框，就打开模态框
              if (!this.$refs["modal"].showModal) {
                this.showModal($event, targetDI, bid, true);
              }
              break;
            }
          }
        }
        // this.showEvent($event);
      }, throttleTime);
    },
    outerDargEnd($event, deskIndex, boxIndex) {
      // 拖拽结束了，修改标志
      this.isDragging = false;
    },
    deskDrop($event, i) {
      console.log('落入', i)
    },
    // 延时一小段间隙，处理悬停时间
    boxDrop($event, deskIndex, boxIndex) {
      // 节流100ms执行一次
      console.log('drop', deskIndex, boxIndex)
      let targetBox = this.desks[deskIndex].boxes[boxIndex];
      let ddi = this.draggingIndex.deskIndex;
      let dbi = this.draggingIndex.boxIndex;
      let draggedBox = this.desks[ddi].boxes[dbi];
      let inDuration = this.inRegion(targetBox.innerSuspendTime, this.suspendJudgeLimit, this.dragIntoTimeLimit);
      let dropIntoFlag = inDuration && this.appCounter(ddi, dbi) > 0;
      let dropIntoBlank = this.appCounter(deskIndex, boxIndex) == 0 && inDuration;
      console.log(dropIntoFlag ? "--划入文件夹--" : "不划入", "===>>耗时总计：", targetBox.innerSuspendTime);
      if (dropIntoFlag && !dropIntoBlank) {
        let draggedApp = {
          id: this.draggingBOX.appGroups[0][0].id,
          name: this.draggingBOX.appGroups[0][0].name
        };
        // 找到最前方空白的box;
        let blankBoxIndex = {gi: 0, ai: 0};
        for (let gi = 0; gi < targetBox.appGroups.length; gi++) {
          for (let ai = 0; ai < targetBox.appGroups[gi].length; ai++) {
            if (targetBox.appGroups[gi][ai].name == '') {
              blankBoxIndex = {gi: gi, ai: ai};
              console.log('blankBoxIndex;', blankBoxIndex)
              break;
            }
          }
        }
        // 先添加app
        targetBox.appGroups[blankBoxIndex.gi][blankBoxIndex.ai] = draggedApp;
        // 然后删除被拖拽的放入新占位盒子
        this.desks[deskIndex].boxes.splice(dbi, 1);
        this.desks[deskIndex].boxes.push(this.buildBlankBox())
        console.log("添加之后", this.desks);
        this.locateBOX();
      }

      window.setTimeout(() => {
        // drop事件发生，悬停时间，全部归零
        this.desks[deskIndex].boxes.forEach((item, index) => {
          item.innerSuspendTime = 0;
          item.outerSuspendTime = 0;
          item.covered = false;
        });
        console.log("已经清空悬停时间");
      }, 200);
    },
    // 移动盒子到空白处或者和其他盒子挤位子
    moveBox(targetDI, targetBI) {

      let boxIndex = this.draggingIndex.boxIndex;
      let deskIndex = this.draggingIndex.deskIndex;
      if (boxIndex == targetBI && deskIndex == targetDI) {
        console.warn('不可以挤压自己，置换自己')
        return;
      }
      let reset = () => {
        // 置换后腰修改draggingIndex的数据
        this.draggingIndex.deskIndex = targetDI;
        this.draggingIndex.boxIndex = targetBI;
        this.locateBOX();
      }
      // TODO 暂时不考虑挤压效果
      // 目标是占位盒子
      let appendToBlank = this.appCounter(targetDI, targetBI) == 0;
      if (targetDI == this.draggingIndex.deskIndex) {
        // 移动方向 true为向右下移动，也就是下标增大；反之就是 小标减小，向左上方移动
        let moveToHigher = boxIndex < targetBI && boxIndex != targetBI;
        let moveToLower = boxIndex > targetBI && boxIndex != targetBI;

        let targetBoxes = this.desks[targetDI].boxes;

        // 从左到右
        if (!appendToBlank) {
          if (moveToHigher) {
            for (let i = boxIndex; i < targetBI; i++) {
              targetBoxes = this.swapEle(targetBoxes, i, i + 1);
            }
            reset();
          } else if (moveToLower) {
            for (let j = boxIndex; j > targetBI; j--) {
              targetBoxes = this.swapEle(targetBoxes, j, j - 1);
            }
            reset();
          }
        } else {
          // 如果是填补空就是直接交换
          targetBoxes = this.swapEle(targetBoxes, boxIndex, targetBI)
          reset();
        }
      } else if (!this.deskSwitching) {
        // TODO: 未完待续，还没有处理好跨桌面的加入
        // 切换到其他桌面
        let draggedBox = this.desks[deskIndex].boxes[boxIndex];
        // 目标桌面
        let targetDesk = this.desks[targetDI];
        if (appendToBlank) {
          // 覆盖掉目标BOX;
          this.desks[targetDI].boxes.splice(targetBI, 1, draggedBox);
          // 用占位BOX替换掉原来的
          // console.log('换掉了',deskIndex, boxIndex)
          this.desks[deskIndex].boxes.splice(boxIndex, 1, this.buildBlankBox());
          // console.log('换掉了',draggedBox, targetDI, targetBI)
          reset();
        } else {
          // 追加到目标区域;
          console.log('顶走他啊', deskIndex, boxIndex)
          targetDesk.boxes.splice(targetBI, 0, draggedBox);
          this.desks[deskIndex].boxes.splice(boxIndex, 1, this.buildBlankBox());
          // this.adjustDesk(targetDI, targetBI);
          reset();
        }
      }
    },
    // 处理拖入 suspendTime计时判断，悬停位置最后的offset 相关动画，行为（并入）
    boxDragEnter($event, deskIndex, boxIndex) {
      console.log('drag-enter', deskIndex, boxIndex)
    },
    // 处理拖出
    boxDragLeave($event, deskIndex, boxIndex) {
      console.log('drag-leave', deskIndex, boxIndex)
    },
    boxDragEnd($event, deskIndex, boxIndex) {
      console.log('drag-end', deskIndex, boxIndex)
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
    showModal($event, deskIndex, boxIndex, dragInto) {
      $event.stopPropagation();
      // 只有多应用才能打开模态框，或者拖拽进入
      // let targetBox = this.desks[deskIndex].boxes[boxIndex];
      let appCount = this.appCounter(deskIndex, boxIndex)
      // console.log(targetBox.appGroups, appCount);
      if (appCount > 1 || dragInto == true) {
        // 指定具体要显示的 modal内容 已经在mouseenter中完成以下注释代码的功能
        window.setTimeout(() => {
          this.modal.index.desk = deskIndex;
          this.modal.index.box = boxIndex;
          this.$refs["modal"].toggleModal();
        }, 10);
      }
    },
    // 被点击的BOX会弹出模态框，同时BOX消失
    checkedBOX(deskIndex, boxIndex) {
      let checkedFlag = (
        (this.$refs["modal"] == undefined
          ? false
          : this.$refs["modal"].showModal) &&
        this.modal.index.desk == deskIndex &&
        this.modal.index.box == boxIndex
      );
      return {
        "opacity": checkedFlag ? 0 : 1
      }
      //
    },
    filledBOX(deskIndex, boxIndex) {
      let appCount = this.appCounter(deskIndex, boxIndex)
      // console.log(appCount)
      return {
        "box-shadow": appCount == 0 ? 'none' : '1px 1px 5px 1px rgb(0 0 0 / 60%);'
      }
    },
    //1px 1px 5px 1px rgb(0 0 0 / 60%);
    // 鼠标按下定位好点击地址
    mousedown($event) {
      this.mouse.x = $event.clientX;
      this.mouse.y = $event.clientY;
    },
    // 鼠标移动 节流
    mousemove($event) {
      if (!this.mouseMoveFlag) {
        return;
      }
      this.mouseMoveFlag = false;
      window.setTimeout(() => {
        this.mouseMoveFlag = true;
      }, 200);
    },
    switchUnit(offset) {
      let lowLimit = this.currentDeskNo + offset > -1;
      let hightLimit = this.currentDeskNo + offset < this.desks.length
      if (lowLimit && hightLimit) {
        this.currentDeskNo += offset;
      }
    },
    enterDragMode() {
      // const boxMaxLimit = this.layout.col * this.layout.row;
      // let boxes = [];
      // // 盒子里填充的App空位
      // for (let i = 0; i < boxMaxLimit; i++) {
      //   boxes.push(this.buildBlankBox());
      // }
      let tempDesk = {
        order: this.desks.length + 1,
        boxes: [],
        name: `第${this.desks.length + 1}个桌面`,
        id: uuidv4()
      };
      // 临时添加的组
      this.desks.push(tempDesk);

      // 遍历每一个桌面
      this.desks.forEach((desk, did) => {
        let boxes = Array.from(desk.boxes);
        boxes.forEach((box, bid) => {
          // 加一个临时组
          let tempBoxGroup = [];
          for (let i = 0; i < this.groupAppLimit; i++) {
            let app = {name: "", id: uuidv4()};
            tempBoxGroup.push(app);
          }
          // 必须要总数大于1，才需要添加组; 占位盒子以及单app的盒子不需要添加组
          if (this.appCounter(did, bid) > 1) {
            box.appGroups.push(tempBoxGroup);
          }
          box.displayNo = box.appGroups.length - 1;
        });
      });
      this.fillBlank();
      this.$forceUpdate();
      this.locateBOX();
    },
    quitDragMode() {

      this.desks.forEach((desk, did) => {
        desk.boxes.forEach((box, bid) => {
          let appGroups = box.appGroups;
          // 该盒子有效app总计数量
          let appCountTotal = this.appCounter(did, bid);
          // 要区分，占位BOX和空闲组 之间的 区别
          if (appCountTotal > 0) {
            appGroups = Array.from(appGroups).filter((group, gid) => {
              return group.filter(app => {
                return app.name != ''
              }).length > 0
            });
          } else {
            appGroups = appGroups;
          }
          // 如果原来的显示组超过了组数，就锁定到最后一组显示复位
          // if (box.displayNo > box.appGroups.length - 1) {
          box.displayNo = 0;
        });
      });
      // 只留实际有效APP数量大于0的桌面
      this.desks = this.desks.filter((desk, did) => {
        // 该组app计数一下
        let appCount = 0;
        // 算出该桌面每个BOX的内含有效(非占位)APP
        desk.boxes.forEach((box, bid) => {
          appCount += this.appCounter(did, bid);
        });
        console.log(did, '该桌面app数量', appCount)
        return appCount > 0;
      })
    }
  },
  filters: {
    resolveAppName(appName) {
      if (appName || appName != "") {
        return appName;
      } else {
        return "空盒子"
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
//transition: all 0.5s ease-in-out;
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
  flex-wrap: nowrap;
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
  //border: 0.5px skyblue groove;
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
  transition: transform 0.25s ease-in-out;
}

.ndg-content-border {
  position: relative;
  margin: 0 auto;
  width: var(--boxinitWidth);
  height: var(--boxinitHeight);
  border-radius: 5%;
  box-shadow: 1px 1px 5px 1px rgb(0 0 0 / 60%);
  overflow: hidden;
  transition: opacity 0.5s ease-in-out;
  animation-fill-mode: backwards;
}

.ndg-desc {
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
  Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  /* font-family: 'Times New Roman', Times, serif; */
  /* Arial, Helvetica, sans-serif  */
  bottom: 0rem;
  color: whitesmoke;
  font-weight: 400;
  align-self: center;
  user-select: none;
  transition: all 0.5s ease-in-out;
  animation-fill-mode: backwards;
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

@media screen and (orientation: portrait) {
  .ndg-container {
    width: 100vmin;
    height: 100vmax;
    align-content: flex-start;
  }

  .ndg-outer {
    /* 限制宽度 */
    min-width: calc(calc(100% / 5));
    max-width: calc(calc(100% / 5));
    /* 限制高度 */
    max-height: calc(calc(100% / 8));
    min-height: calc(calc(100% / 8));

  }

  .ndg-desc {
    font-size: 2vmin;
  }
}
</style>
