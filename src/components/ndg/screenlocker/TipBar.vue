<template>
  <div class="tipbar">
    <!-- 主版面-->
    <div class="main-panel" :style="{'transform': offset}"
         draggable="true"
         @dragstart="dragStart($event)"
         @dragend="dragEnd($event)"
         @dragover="dragOver($event)"
         @dblclick="enterApp($event)"
         ref="panel">
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
    <!-- 左侧抽屉-->
    <div class="left-draw" :style="{'z-index': offsetX > barWidth? 1: -1, 'opacity': offsetX > 200 ? 1: 0}">
      <div>左侧 查看 清空</div>
      <slot name="left-draw"></slot>
    </div>
    <!-- 右侧抽屉 -->
    <div class="right-draw" :style="{'z-index': offsetX < -barWidth ? 1: -1, 'opacity': offsetX < -200 ? 1: 0}">
      <div>右侧 查看 清空</div>
      <slot name="right-draw"></slot>
    </div>
  </div>
</template>

<script>

import MyIcon from "@/components/ndg/MyIcon";
import {blankEle, gradientSplit} from "@/components/ndg/common/common";
import {Timer} from "@/components/ndg/timer";

export default {
  name: "TipBar",
  components: {MyIcon},
  data() {
    return {
      timer: new Timer(),
      startPos: {
        screenX: 0,
        screenY: 0,
      },
      offsetX: 0,
      offsetY: 0,
      barWidth: 0,
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
    dragBackLimit: {
      type: Number,
      default: 0.5
    }
  },
  mounted() {
    this.calcBarWidth();
  },
  updated() {
    this.calcBarWidth();
  },
  computed: {
    offset() {
      return `translateX(${this.offsetX}px)`
    },
  },
  watch: {},
  methods: {
    dragStart($event) {
      $event.dataTransfer.effectAllowed = "move";
      $event.dataTransfer.setDragImage(blankEle, 0, 0)
      this.startPos.screenX = $event.screenX;
      this.startPos.screenY = $event.screenY;
    },
    dragOver($event) {
      this.offsetX = $event.screenX - this.startPos.screenX
      console.log('dragOver', '触发', this.offsetX)
    },
    dragEnd($event) {
      console.log('dragEnd', '触发', this.offsetX, this.barWidth, this.barWidth * this.dragBackLimit)
      const overLimit = Math.abs(this.offsetX) > this.barWidth * this.dragBackLimit
      // 位移长度不够，就返回原始位置
      if (!overLimit) {
        // 默认从大到小 如果是向左移动，就翻转一下数组
        let linSpace = gradientSplit(this.offsetX, 0, 25, this.offsetX < 0)
        // 阶梯移动
        for (let i = 0; i < linSpace.length; i++) {
          setTimeout(() => {
            this.offsetX = linSpace[i]
          }, 25 * i);
        }
      } else if (overLimit) {         // 位移长度足够，则自动进入到当前动作的末尾
        let linSpace = gradientSplit(this.offsetX, this.offsetX > 0 ? this.barWidth : -1 *this.barWidth, 25, this.offsetX > 0)
        console.log('dragEnd', linSpace)
        // 阶梯移动
        for (let i = 0; i < linSpace.length; i++) {
          setTimeout(() => {
            this.offsetX = linSpace[i]
          }, 25 * i);
        }
      }

    },
    calcBarWidth() {
      let bar = document.getElementsByClassName('main-panel')[0]
      if (bar) {
        this.barWidth = bar.getBoundingClientRect().width;
      } else {
        this.barWidth = 0;
      }
    },
    enterApp($event) {
      this.$emit('enterApp')
    }
  }

}
</script>

<style scoped>
.tipbar {
  z-index: 0;
  color: black;
  height: 90%;
  background-color: rgba(255, 255, 255, 0.4);
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
  width: 100%;
  text-align: left;
  opacity: 1;
  transition: opacity 1s linear;
}

.app-icon {
  width: 20%;
}

.bar {
  width: 80%;
}

.bar1 {
  display: flex;
  height: 30%;
  font-size: 12px;
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
  height: 38%;
  font-size: 16px;
  font-weight: 600;
}

.bar3 {
  height: 32%;
}

</style>
<style scoped>

.left-draw {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
  transition: opacity 0.5s ease-in-out;
}

.right-draw {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
  transition: opacity 0.5s ease-in-out;
}
</style>
