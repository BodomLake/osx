<template>
  <div class="tipbar" :id="tip.id" @mousedown="checkBar($event, tip.id)" ref="panel">
    <!-- 主版面-->
    <div class="main-panel" :style="{'transform': scrollOffset, 'transition': transition}" draggable="true"
         @dragstart="dragStart($event,tip.id)"
         @dragend="dragEnd($event, tip.id)"
         @dragover="dragOver($event, tip.id)"
         @mouseup="mu($event)">
      <div class="left-cover cover"></div>
      <div class="middle-layer cover" @dblclick="enterApp($event, tidx)">
        <div class="app-icon">
          <div style="position: relative;height: 100%">
            <my-icon :class-name="tip.app"></my-icon>
          </div>
        </div>
        <div class="bar">
          <div class="bar1">
            <div>
              <span>{{ tip.name }}</span>
            </div>
            <div>
              <span>{{ tip.time }}</span>
            </div>
          </div>
          <div class="bar2">
            <div>{{ tip.title }}</div>
          </div>
          <div class="bar3">
            <div>{{ tip.subTitle }}</div>
          </div>
        </div>
      </div>
      <div class="right-cover cover"></div>
    </div>
    <!-- 左侧抽屉-->
    <template v-if="totalOffset > 0">
      <div :style="{'z-index': totalOffset >= barRect.width ? 2: -1}"
           class="left-draw" @mousedown="md($event, 'left')" ref="left">
        <div :style="{'z-index': totalOffset >= barRect.width/3 ? 2: -1, 'opacity': totalOffset >= barRect.width/3 ? 1: 0}">
          左侧
        </div>
        <div
          :style="{'z-index': totalOffset >= barRect.width*2/3 ? 2: -1, 'opacity': totalOffset >= barRect.width*2/3? 1: 0}">
          查看
        </div>
        <div :style="{'z-index': totalOffset >= barRect.width ? 2: -1, 'opacity': totalOffset >= barRect.width ? 1: 0}">清空
        </div>
        <slot name="left-draw"></slot>
      </div>
    </template>
    <!-- 右侧抽屉 -->
    <template v-if="totalOffset < 0">
      <div :style="{'z-index': totalOffset >= barRect.width ? 2: -1}"
           @mousedown="md($event, 'right')" class="right-draw" ref="right">
        <div
          :style="{'z-index': totalOffset <= -barRect.width ? 2: -1, 'opacity': totalOffset <= -barRect.width ? 1: 0}">
          清理
        </div>
        <div
          :style="{'z-index': totalOffset <= -barRect.width*2/3 ? 2: -1, 'opacity': totalOffset <= -barRect.width*2/3? 1: 0}">
          删除
        </div>
        <div :style="{'z-index': totalOffset <= -barRect.width/3 ? 2: -1, 'opacity': totalOffset <= -barRect.width/3 ? 1: 0}">
          右侧
        </div>
        <slot name="right-draw"></slot>
      </div>
    </template>
  </div>
</template>

<script>

import MyIcon from "@/components/ndg/MyIcon";

import {Timer} from "@/components/ndg/timer";
import Drag from './drag.js'

export default {
  name: "TipBar",
  components: {MyIcon},
  mixins: [Drag],
  data() {
    return {
      timer: new Timer(),
      startPos: {
        pageX: 0,
        pageY: 0,
        clientY: 0,
        clientX: 0
      },
      // 临时位移（瞬变）
      offsetX: 0,
      // 基础位移（记录）
      baseOffsetX: 0,
      barRect: {
        height: 0,
        width: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      },
      scrolling: false,
      horzDrag: true,
    }
  },
  props: {
    tip: {
      required: true,
      type: Object,
      default: () => {
        return {}
      }
    },
    tidx: {
      type: Number,
      default: 0,
    },
    dragBackLimit: {
      type: Number,
      default: 0.5
    }
  },
  mounted() {
    this.calcBarRect();
  },
  updated() {

  },
  watch: {},
  computed: {
    scrollOffset() {
      return `translateX(${this.totalOffset}px)`
    },
    totalOffset() {
      return this.offsetX + this.baseOffsetX
    },
    transition() {
      return this.scrolling ? '' : 'transform 0.2s ease-in-out';
    },
    dragOut() {
      if (this.offsetX == 0) {
        return false;
      }
      return Math.abs(this.offsetX) >= this.barRect.width * this.dragBackLimit
    },
    dragBack() {
      if (this.offsetX != 0) {
        return false;
      }
      return Math.abs(this.offsetX) >= this.barRect.width * (1 - this.dragBackLimit)
    },
    leftDrawStyle() {

    },
    rightDrawStyle() {

    }
  },
  methods: {
    enterApp($event, tidx) {
      this.$emit('enterApp', tidx)
    },
    checkBar($event, tid) {
      this.$emit('startDrag', tid, this.startPos)
    },
    calcBarRect() {
      let bar = document.getElementsByClassName('tipbar')[0]
      if (bar) {
        this.barRect = bar.getBoundingClientRect()
        return bar.getBoundingClientRect();
      }
    },
    /**
     * 鼠标按下，点击事件在抽屉处响应，使其下沉(left-draw right-draw)
     */
    md($event, side) {
      console.log($event.target, side)
      if (this.$refs['left']) {
        this.$refs['left'].style.zIndex = -1
      }
      if (this.$refs['right']) {
        this.$refs['right'].style.zIndex = -1
      }
    },
    /**
     * 鼠标弹起，点击事件扩散到上层(main-panel)
     * @param $event
     */
    mu($event) {
      console.log($event.target)
      if (this.$refs['left']) {
        this.$refs['left'].style.zIndex = 2
      }
      if (this.$refs['right']) {
        this.$refs['right'].style.zIndex = 2
      }
    },
  }

}
</script>

<style scoped>
.tipbar {
  z-index: 0;
  color: black;
  height: 95%;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 15px 15px 15px 15px;
  user-select: none;
  position: relative;
  top: 50%;
  transform: translate(0%, -50%);
  transition: all 500ms ease-in-out;
}

.tipbar :hover {
  cursor: url("/static/cursor/link.cur"), auto;
}

.main-panel {
  position: absolute;
  display: flex;
  flex-direction: row;
  height: 100%;
  z-index: 2;
  width: 300%;
  text-align: left;
  left: -100%;
  opacity: 1;
  justify-content: center;
  transition: opacity 1s linear;
}

.cover {
  width: 100%;
  height: 100%;
}

.right-cover {

}

.left-cover {

}

.middle-layer {
  display: flex;
  flex-direction: row;
}

.app-icon {
  width: 20%;
  opacity: 1;
}

.bar {
  width: 80%;
  opacity: 1;
  padding-top: 1%;
  padding-bottom: 1%;
}

.bar1 {
  display: flex;
  height: 30%;
  font-size: 1.8vmin;
  text-align: center;
}

.bar1 > div {
  height: 100%;
  vertical-align: bottom;
}

.bar1 > div:nth-child(1) {
  width: 85%;
}

.bar1 > div:nth-child(2) {
  width: 15%;
}

.bar2 {
  height: 40%;
  font-size: 2.5vmin;
  font-weight: 600;
}

.bar3 {
  height: 30%;
  font-size: 1.8vmin;
}

</style>
<style scoped>

.left-draw {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 1;
  transition: opacity 0.5s ease-in-out;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.left-draw > div {
  width: calc(100% / 3);
  height: 100%;
  transition: opacity 0.1s ease-in-out;
}

.bar1 > div > span {
  height: 100%;
}

.right-draw {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 1;
  transition: opacity 0.5s ease-in-out;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.right-draw > div {
  width: calc(100% / 3);
  height: 100%;
  transition: opacity 0.1s ease-in-out;
}

</style>
