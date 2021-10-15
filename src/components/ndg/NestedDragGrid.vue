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
          <transition-group tag="div" :draggable="isDragging" class="ndg-container" name="ndg-outer-shift"
                            :duration="switchDuration">
            <template v-for="(box, j) in desk.boxes">
              <div class="ndg-outer" :style="[gridSize]" :key="box.id" @click="($event)=>{$event.stopPropagation()}"
                   @mouseenter="ome($event, i, j)" @mouseleave="oml($event, i ,j)"
                   @dragenter="outerDragEnter($event,i,j)"
                   @dragover="outerDragOver($event, i ,j)"
                   @dragleave="outerDragLeave($event,i,j)"
                   @dragend="outerDragEnd($event, i ,j)"
                   @drop="outerDrop($event,i,j)">
                <div class="ndg-content-border" :class="{'ndg-box-covered': box.covered}"
                     :style="[boxSize, checkedBOXStyle(i,j), filledBOX(i,j)]" :key="box.id" :draggable="enableDrag"
                     @dblclick="showModal($event, i,j)"
                     @dragstart="boxStartDrag($event,i,j)"
                     @drag="boxDrag($event, i, j)"
                     @dragend="boxDragEnd($event,i,j)"
                     @drop="boxDrop($event,i,j)"
                     @dragenter="boxDragEnter($event,i,j)"
                     @dragover="boxDragOver($event, i, j)"
                     @dragleave="boxDragLeave($event,i,j)"
                     @touchstart="touchstart" @touchend="touchend" @touchmove="touchmove">
                  <Box v-model="desk.boxes[j]" :id="box.id" :name="box.name" :enableDrag="enableDrag"></Box>
                </div>
                <div class="ndg-desc" style="animation:none" :style="[checkedBOXStyle(i,j)]">
                  {{ box.name | resolveAppName }}
                </div>
              </div>
            </template>
            <div :id="desk.rect1" :key="desk.rect1" name="rect1"
                 @dragenter="restZoneDragEnter($event, i)" @dragleave="restZoneDragLeave($event, i, 1)"
                 @dragover="restZoneDragOver($event, i)" @drop="restZoneDrop($event, i)"
                 :style="{'max-height': gridSize['--gh'], 'min-height': gridSize['--gh'], 'width': rectArr1[i] }">
            </div>
            <div :id="desk.rect2" :key="desk.rect2" name="rect2" style="height: auto"
                 @dragenter="restZoneDragEnter($event, i)" @dragleave="restZoneDragLeave($event, i, 2)"
                 @dragover="restZoneDragOver($event, i)" @drop="restZoneDrop($event, i)"
                 :style="{'width': '100%','height': rectArr2[i]}">
            </div>
          </transition-group>
        </div>
      </template>
    </div>
    <!-- 文件夹的模态框，要在确定了的情况下加以渲染，即同时满足当下的定位和双击事件-->
    <BoxModal v-model="desks" :portrait="portrait" :enableDrag="enableDrag" ref="modal" :modalIndex="modalIndex"
              @shiftIntoModalFromDesk="shiftIntoModalFromDesk"
              @shiftOutFromModal="shiftOutFromModal"
              @shiftIntoModalFromOtherModal="shiftIntoModalFromOtherModal"></BoxModal>
    <Indicator v-model="desks" @scrollToDestDesk="switchUnit" :displayNum="currentDeskNo"></Indicator>
    <DockBar v-model="dockApps"></DockBar>
    <canvas id="canvas" style="display:none"></canvas>
  </div>
</template>

<script>
// TODO 并入，模态框拽出app，并入盒子，模态框消失在视野中，模糊度恢复到blur(0px);
// 导入自定义组件
import DockBar from "./DockBar.vue";
import Indicator from "./Indicator.vue";
import MyIcon from "./MyIcon.vue";
import ShiftZone from "./ShiftZone.vue";
import BoxModal from "./modal/BoxModal.vue";
import Box from "./box/Box.vue";
// 混入：拆分各个区域功能代码
import initMixin from "./mixins/init.js";
import innerMixin from "./mixins/inner.js";
import outerMixin from "./mixins/outer.js";
import mobileMixin from "./mixins/mobile.js";
import listenerMixin from "./mixins/listener.js";
// 导入公共用途库
import {v4 as uuidv4} from "uuid";
import {Timer} from "@/components/ndg/timer";
import {APP, DOCKAPP, isDockApp, isInnerBox, isModalApp, isOuterBox, swapEle} from "@/components/ndg/common";
import {OUTERBOX} from "./common";

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
  mixins: [initMixin, outerMixin, innerMixin, mobileMixin, listenerMixin],
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
      default: 250
    },
    // 拖入app集合内的判定时间
    dragIntoTimeLimit: {
      type: Number,
      default: 1000
    },
    boxInitRatio: {
      type: Number,
      default: 0.85
    },
    switchDuration: {
      type: Number,
      default: 500
    },
    // 判定区域伸缩
    threshold: {
      type: Object,
      default: () => {
        return {
          horizontal: 1,
          vertical: 1
        }
      }
    },
    throttleTime: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {
      // DockBar 中的app列表
      dockApps: {
        usually: [],
        running: []
      },
      modalIndex: {
        deskIndex: 0,
        boxIndex: 0,
        groupIndex: 0,
        appIndex: 0,
      },
      // 正在拖拽？初始化为否
      isDragging: false,
      // 正在移动
      movingBox: false,
      // 拖拽跨过桌面了
      crossDesk: false,
      // 启用拖拽？进入拖拽模式，桌面添加一个；BOX全部添加一组，并且滑动到最后一组（displayNum调节到最大）；对应的指示器也要添加一个圆点
      enableDrag: false,
      // 正在切换桌面
      deskSwitching: false,
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
      // 设备摆放方向 默认 landscape 所以是false
      portrait: window.innerHeight > window.innerWidth,
    };
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
    // 桌面拖拽的时候 被拖拽的BOX
    draggingBOX: {
      cache: false,
      get() {
        return this.desks[this.$store.state.draggingIndex.deskIndex].boxes[this.$store.state.draggingIndex.boxIndex];
      }
    },
    // 桌面拖拽的时候 目标BOX
    targetBOX: {
      cache: false,
      get() {
        let ddi = this.$store.state.targetIndex.deskIndex
        let dbi = this.$store.state.targetIndex.boxIndex
        return this.desks[ddi].boxes[dbi];
      }
    },
    // 方格尺寸
    gridSize() {
      return {
        "--gw": 100 / this.layout.col + "vw",
        "--gh": 80 / this.layout.row + "vh"
      }
    },
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
    },
  },
  methods: {
    shiftIntoModalFromOtherModal(groupIndex) {
      console.log('shiftIntoModalFromOtherModal', '从modal拖出再从Modal中拖入');
      let di = this.$store.state.draggingIndex;
      let draggedAPP = this.desks[di.deskIndex].boxes[di.boxIndex].appGroups[di.groupIndex].splice(di.appIndex, 1)[0];
      let modal = this.desks[this.modalIndex.deskIndex].boxes[this.modalIndex.boxIndex]
      console.log(di, draggedAPP, modal)
      modal.appGroups[groupIndex].push({
        name: draggedAPP.name,
        id: draggedAPP.id,
      })
    },
    /**
     * 从Modal内部拖出APP
     * @param groupIndex
     * @param appIndex
     */
    shiftOutFromModal(groupIndex, appIndex) {
      this.modalIndex.appIndex = appIndex;
      this.modalIndex.groupIndex = groupIndex;
    },
    /**
     *  桌面的单APP，响应放入，<BoxModal\>的<Box\>之中
     *  @param groupIndex (displayNum)
     */
    shiftIntoModalFromDesk(groupIndex) {
      // 模态框定位
      let mdi = this.modalIndex.deskIndex;
      let mbi = this.modalIndex.boxIndex;

      // 删掉被拖拽的单位
      let ddi = this.$store.state.draggingIndex.deskIndex;
      let dbi = this.$store.state.draggingIndex.boxIndex
      let dgi = this.$store.state.draggingIndex.groupIndex
      let dai = this.$store.state.draggingIndex.appIndex

      const draggedApp = this.desks[ddi].boxes[dbi].appGroups[dgi][dai];
      // 被拖拽的app的内容
      const app = {name: draggedApp.name, id: draggedApp.id}
      console.log('拖入的APP是：', app.name, '序号：', ddi, dbi, dgi, dai, 'modal序号:', mdi, mbi)
      // 把APP加入到盒子的某个APP组内
      this.desks[mdi].boxes[mbi].appGroups[groupIndex].push(app);
      // 确认目标位置
      this.$store.commit('setTargetIndex', {
        deskIndex: this.modalIndex.deskIndex,
        boxIndex: this.modalIndex.boxIndex,
        groupIndex: groupIndex,
        appIndex: this.desks[mdi].boxes[mbi].appGroups[groupIndex].length - 1
      })
      this.desks[ddi].boxes[dbi].appGroups[dgi].splice(dai, 1);
      // 是否移除桌面上的盒子,app个数为0，就删了他
      if (this.appCounter(ddi, dbi) == 0) {
        this.desks[ddi].boxes.splice(dbi, 1);
        // 位置也要变动啊 (要同一桌面，还要目标BOX(Modal)下标比被拖拽的boxIndex大，也就是小标往后移)
        let adjust = dbi < mbi && ddi == mdi;
        if (adjust) {
          this.modalIndex.boxIndex = mbi - 1;
        }
      }
    },
    /**
     * rect1 rect2部分 拖出
     * @param $event
     * @param deskIndex
     * @param rectNo
     */
    restZoneDragEnter($event, deskIndex) {
      console.info('移入', deskIndex)
      this.desks[deskIndex].rectTimer.start();
    },
    /**
     * rect1 rect2部分 拖出
     * @param $event
     * @param deskIndex
     * @param rectNo
     */
    restZoneDragLeave($event, deskIndex, rectNo) {
      this.desks[deskIndex].rectTimer.shutdown();
    },
    /**
     * restZoneDragOver
     * @param $event
     * @param deskIndex
     */
    restZoneDragOver($event, deskIndex) {
      // 目标桌面的BOX个数
      $event.preventDefault();
    },
    /**
     * 落入空闲区域
     * @param $event
     * @param deskIndex
     */
    restZoneDrop($event, deskIndex) {
      console.info('落入', deskIndex)
      let boxNo = this.desks[deskIndex].boxes.length;
      // const timeOver = this.desks[deskIndex].rectTimer.time > this.suspendJudgeLimit;
      if (isOuterBox(this) || isInnerBox(this)) {
        // 如果拖拽是跨桌面的，就不用前置顺序
        let adjust = (deskIndex == this.$store.state.draggingIndex.deskIndex) ? -1 : 0;
        this.shiftBOX(deskIndex, boxNo + adjust);
        this.desks[deskIndex].rectTimer.shutdown();
        // TODO
      } else if (isModalApp(this)) {
        //  如果是从Modal中或者Dock中拖入到桌面
        this.modalAppIntoDesk(deskIndex, boxNo);
      } else if (isDockApp(this)) {
        //  如果是从Modal中或者Dock中拖入到桌面
        this.dockAppIntoDesk(deskIndex, boxNo);
      }
    },

    /**
     * 把被拖拽的BOX拖拽到目标位置（统一桌面内：非一次置换，是多次置换）
     * @param targetDI
     * @param targetBI
     */
    shiftBOX(targetDI, targetBI) {
      // 移动BOX，或者切换桌面的时候，不允许再移动BOX
      if (this.movingBox || this.deskSwitching) {
        console.info('当前正在移动BOX，或者切换桌面')
        return;
      }
      let boxIndex = this.$store.state.draggingIndex.boxIndex;
      let deskIndex = this.$store.state.draggingIndex.deskIndex;
      if (boxIndex == targetBI && deskIndex == targetDI) {
        console.warn('不可以挤压自己，置换自己')
        this.movingBox = false;
        return;
      }
      let reset = () => {
        // 置换后腰修改draggingIndex的数据
        this.$store.commit('setDraggingIndex', {
          deskIndex: targetDI,
          boxIndex: targetBI,
        })
        this.locateBOX();
        // 移动结束了
        setTimeout(() => {
          console.info('movingBox已经重置为false')
          this.movingBox = false;
        }, this.switchDuration)
      }
      // 开始移动BOX
      this.movingBox = true;
      // TODO 暂时不考虑挤压效果
      if (targetDI == deskIndex) {
        // 移动方向 true为向右下移动，也就是下标增大；反之就是 下标减小，向左上方移动
        let moveToHigher = boxIndex < targetBI && boxIndex != targetBI;
        let moveToLower = boxIndex > targetBI && boxIndex != targetBI;
        // 目标的盒子们
        let targetBoxes = this.desks[targetDI].boxes;
        // 从左到右
        if (moveToHigher) {
          for (let i = boxIndex; i < targetBI; i++) {
            targetBoxes = swapEle(targetBoxes, i, i + 1);
          }
          reset();
        } else if (moveToLower) {
          // 从右到左
          for (let j = boxIndex; j > targetBI; j--) {
            targetBoxes = swapEle(targetBoxes, j, j - 1);
          }
          reset();
        }
      } else {
        let draggedBOX = this.desks[deskIndex].boxes.splice(boxIndex, 1)[0]
        this.desks[targetDI].boxes.splice(targetBI, 0, draggedBOX);
        reset();
      }
    },

    /**
     * 从modal中拖出，放入到桌面上
     * @param deskIndex 目标桌面
     * @param boxIndex 放到目标盒子附近
     */
    modalAppIntoDesk(deskIndex, boxIndex) {
      console.log('从modal中拖出，放入到桌面上')
      let dgi = this.$store.state.draggingIndex.groupIndex;
      let dai = this.$store.state.draggingIndex.appIndex;
      let appGroups = this.desks[this.modalIndex.deskIndex].boxes[this.modalIndex.boxIndex].appGroups;
      let app = appGroups[dgi][dai];
      console.log(appGroups, app, dgi, dai)
      let insertBox = {
        id: uuidv4(),
        name: app.name,
        appGroups: [[{
          'name': app.name,
          'id': app.id
        }]],
        groupAppLimit: 9,
        innerSuspendTimer: new Timer(),
        outerSuspendTimer: new Timer(),
        covered: false,
        showModal: false,
        displayNum: 0,
      }
      // 在桌面appGroups.[deskIndex].boxes[boxIndex]上追加盒子
      this.desks[deskIndex].boxes.splice(boxIndex, 0, insertBox);
      // 如果被删掉的盒子所在组只有他一个app的话,删掉该组
      if (appGroups[dgi].length == 1) {
        appGroups.splice(dgi, 1)
        // 改变现实的组号
        this.modalIndex.deskIndex = deskIndex;
        this.modalIndex.boxIndex = boxIndex;
        this.$refs['modal'].box.displayNum--;
      } else {
        // 如果不是只剩一个，就删除单个app
        appGroups[dgi].splice(dai, 1)
      }
    },
    dockAppIntoDesk() {

    },
    /**
     * @param $event
     * @param deskIndex
     * @param boxIndex
     * @param dragInto
     * 打开该文件筐的模态窗 只有多应用才能打开模态框，或者拖拽进入
     */
    showModal($event, deskIndex, boxIndex) {
      $event.stopPropagation();
      let appCount = this.appCounter(deskIndex, boxIndex)
      if (appCount > 1) {
        window.setTimeout(() => {
          this.modalIndex.deskIndex = deskIndex;
          this.modalIndex.boxIndex = boxIndex;
          this.$refs["modal"].toggle();
        }, 10);
      }
    },
    /**
     * 被选中的BOX样式
     * @param deskIndex
     * @param boxIndex
     * @returns {{opacity: (number)}}
     */
    // 被点击的BOX会弹出模态框，同时BOX消失
    checkedBOXStyle(deskIndex, boxIndex) {
      let modal = this.$refs['modal'];
      let checkedFlag =
        (modal && modal.$data['showModal']) &&
        this.modalIndex.deskIndex == deskIndex &&
        this.modalIndex.boxIndex == boxIndex;
      return {"opacity": checkedFlag ? 0 : 1}
    },

    /**
     *
     * @param deskIndex
     * @param boxIndex
     * @returns {{"box-shadow": (string)}}
     */
    filledBOX(deskIndex, boxIndex) {
      let appCount = this.appCounter(deskIndex, boxIndex)
      return {
        "box-shadow": appCount == 0 ? 'none' : '1px 1px 5px 1px rgb(0 0 0 / 60%);'
      }
    },

    /**
     * 鼠标按下定位好点击地址
     * @param $event
     */
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

    /**
     * 切换桌面
     */
    switchUnit(offset) {
      let lowLimit = this.currentDeskNo + offset > -1;
      let hightLimit = this.currentDeskNo + offset < this.desks.length
      if (lowLimit && hightLimit) {
        this.currentDeskNo += offset;
      }
    },

    /**
     * 进入拖拽模式
     */
    enterDragMode() {
      let tempDesk = {
        order: this.desks.length + 1,
        boxes: [],
        name: `第${this.desks.length + 1}个桌面`,
        id: uuidv4(),
        rect1: uuidv4(),
        rect2: uuidv4(),
        rectTimer: new Timer()
      };
      // 临时添加的组
      this.desks.push(tempDesk);

      // 遍历每一个桌面
      this.desks.forEach((desk, did) => {
        let boxes = Array.from(desk.boxes);
        boxes.forEach((box, bid) => {
          // 加一个临时组
          let tempBoxGroup = [];
          // 必须要总数大于1，才需要添加组; 占位盒子以及单app的盒子不需要添加组
          if (this.appCounter(did, bid) > 1) {
            box.appGroups.push(tempBoxGroup);
          }
          box.displayNum = box.appGroups.length - 1;
        });
      });
      this.$forceUpdate();
      this.locateBOX();
    },

    /**
     * 退出拖拽模式
     */
    quitDragMode() {
      this.desks.forEach((desk, did) => {
        desk.boxes.forEach((box, bid) => {
          let appGroups = box.appGroups;
          // 该盒子有效app总计数量
          let appCountTotal = this.appCounter(did, bid);
          // 要区分，占位BOX和空闲组 之间的 区别
          if (appCountTotal > 0) {
            appGroups = Array.from(appGroups).filter((group, gid) => {
              return group.length > 0;
            })
          }
          this.desks[did].boxes[bid].appGroups = appGroups;
          // 如果原来的显示组超过了组数，就锁定到最后一组显示复位
          // if (box.displayNum > box.appGroups.length - 1) {
          box.displayNum = 0;
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
        console.info(did, '该桌面app数量', appCount)
        return appCount > 0;
      })
    }
  },
  filters: {
    resolveAppName(appName) {
      if (appName || appName != "") {
        return appName;
      } else {
        return "空"
      }
    }
  }
};
</script>
<!-- 盒子布局样式，内部app显示样式 -->
<style scoped>
* {
  --gw: var(--gw);
  --gh: var(--gh);
  --boxinitWidth: var(--boxinitWidth);
  --boxinitHeight: var(--boxinitHeight);
}

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
/ / transition: all 0.5 s ease-in-out;
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
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease-in-out;
/ / border: 0.5 px skyblue groove;
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
.ndg-outer-shift-move > .ndg-content-border {
  border: 1px solid white;
  transition: transform 0.5s;
}

.ndg-outer-shift-active > .ndg-content-border {
  transition: all 1s;
}

.ndg-outer-shift-enter-active, .ndg-outer-shift-leave-active > .ndg-content-border {
  transition: all 1s ease-in-out;
  border: 1px solid white;
}

.ndg-outer-shift-enter, .ndg-outer-shift-leave-to > .ndg-content-border {
  opacity: 0.5;
  border: 1px solid white;
}

.ndg-outer-shift-leave-active > .ndg-content-border {
/ / position: absolute;
}

.ndg-content-border {
  position: relative;
  margin: 0 auto;
  width: var(--boxinitWidth);
  height: var(--boxinitHeight);
  border-radius: 5%;
  box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  transition: opacity 0.5s ease-in-out;
  animation-fill-mode: backwards;
/ / pointer-events: none;
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

@import "./css/portrait.css";
</style>
