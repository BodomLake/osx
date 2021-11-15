<template>
  <div style="height: 100%;width: 100%">
    <div class="tips-list" draggable="false"
         @dragstart="listDragStart($event)"
         @dragover="listDragOver($event)"
         @dragend="listDragEnd($event)"
         @mousedown="md($event)"
         @wheel="wheel($event)">

      <div class="list-container" :style="{'transform': scrollOffset, 'transition': transition }" ref="container">
        <transition-group tag="div" style="height: 100%;width: 100%" name="tipbar">
          <template v-for="(tip,tidx) in tipList">
            <div class="tip-item" :style="{'height': defaultHeight,}" :key="tip.id">
              <tip-bar :tip="tip" :tidx="tidx" ref="tipbar"
                       @enterApp="enterApp" @dragEnd="endDrag"
                       @startDrag="startDrag" @dragAct="crossDragOver"
                       @crossOffset="crossOffset">
              </tip-bar>
            </div>
          </template>
        </transition-group>
      </div>

    </div>
    <template>
      <div class="outer-bar-locate rest-bar" v-if="tipList.length > 0">
        <div class="rest-app-bar"></div>
        <div class="clear-all" @click="clearAll">清除</div>
      </div>
    </template>
  </div>
</template>

<script>
import TipBar from "@/components/ndg/screenlocker/TipsList/TipBar";
import {Timer} from "@/components/ndg/timer";
import {
  dongfangcaifu,
  eleme,
  neteasemusic,
  qqmail,
  taobao,
  wechat,
  zhifubao
} from "@/components/ndg/screenlocker/TipsList/example";
import {inRegion} from "@/components/ndg/common/common";

export default {
  name: "TipsList",
  components: {TipBar},
  props: {
    // 一个页面显示的TipBar数量
    displayNum: {
      require: false,
      type: Number,
      default: 6
    },
    overDragRatio: {
      require: false,
      type: Number,
      default: 0.3
    }
  },
  mounted() {
    this.tipList.push(dongfangcaifu)
    this.tipList.push(wechat)
    this.tipList.push(qqmail)
    this.tipList.push(zhifubao)
    this.tipList.push(taobao)
    this.tipList.push(eleme)
    this.tipList.push(neteasemusic)
  },
  model: {
    prop: 'tipList',
    event: 'tipListChange'
  },
  data() {
    return {
      tipList: [],
      // 被拖拽的Bar的id
      dragBarId: '',
      // 被拖拽的Bar的index
      dragBarIndex: 0,
      // 纵向位移量
      offsetY: 0,
      baseOffsetY: 0,
      timer: new Timer(),
      // 拖拽的速度，决定是否要拉到底
      speed: 0,
      // 子组件被点击的时候对应的xy坐标
      startPos: {
        pageX: 0,
        pageY: 0,
        clientY: 0,
        clientX: 0
      },
      contRect: {
        height: 0,
        width: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      },
      dragOverTimer: 0,
      scrolling: false,
      // 水平拖拽？如果是垂直拖拽则是true
      horzDrag: false,
    }
  },
  computed: {
    defaultHeight() {
      return 100 / this.displayNum + '%';
    },
    scrollOffset() {
      return `translateY(${this.totalOffset}px)`
    },
    totalOffset() {
      return this.offsetY + this.baseOffsetY
    },
    transition() {
      return this.scrolling ? '' : 'transform 0.2s ease-in-out';
    }
  },
  methods: {
    enterApp(tid) {
      let app = this.tipList[tid]
      this.$emit('enterApp', app)
    },
    /**
     * 开始拖拽
     */
    startDrag(tid, tidx) {
      // 确定被拖拽的bar的id
      this.dragBarId = tid;
      // 确定被拖拽的bar的下标
      this.dragBarIndex = tidx;
      this.timer.start();
      this.scrolling = true;
    },
    /**
     * 拖拽结束了
     */
    endDrag() {
      this.timer.shutdown()
    },
    /**
     * 让被选中的<TipBar>响应水平位移判断
     * @param clientX
     * @param clientY
     */
    crossDragOver(horzDrag) {
      this.horzDrag = horzDrag;
    },
    /**
     * 外层dom响应<TipBar>的拉拽事件传播
     * @param $event
     */
    listDragStart($event) {
      console.log('x:', $event.pageX, 'y:', $event.pageY, 'list-drag-over')
    },
    /**
     * 外层dom响应<TipBar>的拉拽事件传播，处理是否要让本组件发生纵向位移，也就是滚动条
     * @param $event
     */
    listDragOver($event) {
      // console.log('起始：', 'x', this.startPos.clientX, 'y', this.startPos.clientY)
      // console.log('移动', 'x:', $event.clientX, 'y:', $event.clientY)
      // 如果横向拖拽就不要
      if (this.horzDrag) {
        return;
      }
      // 容器高度以及滚动高度
      const containerHeight = this.$refs['container'].getBoundingClientRect().height;
      const scrollHeight = this.$refs['container'].scrollHeight;
      // 计算出超出的高度
      const excessHeight = Math.abs(containerHeight - scrollHeight)
      // 本次位移目的地 y轴坐标
      const offset = $event.clientY - this.startPos.clientY;
      // 向下拉，正数
      if (inRegion(this.totalOffset, 0, containerHeight * this.overDragRatio) && this.totalOffset >= 0) {
        this.offsetY = offset;
        this.baseOffsetY = 0
      } else if (inRegion(this.totalOffset, -(containerHeight * this.overDragRatio + excessHeight), 0) && this.totalOffset <= 0) {
        this.offsetY = offset;
      }
      // console.log('位移量', this.offsetY, containerHeight, scrollHeight, excessHeight, offset)
    },
    listDragEnd($event) {
      this.scrolling = false;
      // 容器高度以及滚动高度
      const containerHeight = this.$refs['container'].getBoundingClientRect().height;
      const scrollHeight = this.$refs['container'].scrollHeight;
      // 计算出超出的高度
      const excessHeight = Math.abs(containerHeight - scrollHeight)
      console.log('拖拽结束了', containerHeight, scrollHeight)
      // List处于最高位，并且向下拉的时候也就是
      if (this.totalOffset > 0) {
        this.baseOffsetY = 0
        this.offsetY = 0
      } else if (this.offsetY < 0 && Math.abs(this.totalOffset) > excessHeight) {
        // 向上拉,但是也超出了scrollHeight的范围
        // 让基础offset记录这次的位移长度，直接拉到最底，不能让容器超出既有范围
        console.log('listDragEnd', this.totalOffset, this.baseOffsetY, this.offsetY)
        this.offsetY = 0
        this.baseOffsetY = containerHeight - scrollHeight
      } else {        // 向下拉，却没有超出范围
        // 让基础offset记录这次的位移长度
        this.baseOffsetY += this.offsetY;
        this.offsetY = 0;
      }
    },
    clearAll() {
      let no = Math.floor(Math.random() * this.tipList.length)
      this.tipList.splice(0, 1)
    },
    disableScroll($event) {
      $event.preventDefault();
    },
    md($event) {
      // console.log('mousedown', $event)
      this.startPos.clientX = $event.clientX;
      this.startPos.clientY = $event.clientY;
      this.startPos.pageX = $event.pageX;
      this.startPos.pageY = $event.pageY;
    },
    wheel($event) {
      // 容器高度以及滚动高度
      const containerHeight = this.$refs['container'].getBoundingClientRect().height;
      const scrollHeight = this.$refs['container'].scrollHeight;
      // 计算出超出的高度
      const excessHeight = Math.abs(containerHeight - scrollHeight)
      const barHeight = containerHeight / this.displayNum;
      const delta = barHeight / 2
      // console.log($event.deltaY, this.totalOffset, containerHeight * this.overDragRatio - delta, -(-delta + excessHeight + containerHeight * this.overDragRatio))

      // 向上拉，totalOffset要减少
      if ($event.deltaY < 0) {
        if (this.totalOffset >= 0) {
          this.baseOffsetY = 0
        } else {
          this.baseOffsetY += delta;
        }
      } else if ($event.deltaY > 0) {
        // 向下拉，totalOffset要变大
        if (this.baseOffsetY <= -excessHeight) {
          this.baseOffsetY = -excessHeight
        } else {
          this.baseOffsetY -= delta;
        }
      }
    },
    crossOffset(clientX) {
      this.$refs['tipbar'][this.dragBarIndex].crossOffset(clientX)
    }
  }
}
</script>

<style scoped>
.tips-list {
  height: inherit;
  width: 40vw;
  position: relative;
  left: 50%;
  transform: translate(-50%, 0);
  overflow-y: hidden;
  overflow-x: hidden;
  /*  display: flex;
    flex-wrap: wrap;
    align-content: flex-start;*/
}

.tips-list::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.tips-list .tip-item {
  width: 100%;
  justify-items: center;
}

@media screen and  (orientation: portrait) {
  .tips-list {
    width: 40vh;
  }
}

.outer-bar-locate {
  left: 50%;
  transform: translateX(-50%);
  position: fixed;
  width: 40vw;
  height: 3vh;
}

.rest-bar {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 6px 6px 6px 6px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 3vh;
}

.rest-app-bar {
  width: 80%;
  overflow-x: scroll;
}

.rest-app-bar::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.clear-all {
  width: 20%;
  color: skyblue;
  font-weight: 600;
  font-size: 1.8vmin;
  user-select: none;
  cursor: url("/static/cursor/link.cur"), auto;
}

.list-container {
  height: 100%;
  width: 100%;
}
</style>
<style scoped>
.tipbar-leave {
  transform: translateX(0%);
  opacity: 1;
}

.tipbar-leave-to {
  transform: translateX(100%);
  opacity: 0.2;
}

.tipbar-leave-active {
  transition: all 0.8s ease-in-out;
}
</style>
