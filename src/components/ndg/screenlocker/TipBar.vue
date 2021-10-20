<template>
  <div class="tipbar" :id="tip.id" @mousedown="()=>{this.$emit('startDrag', tip.id)}">
    <!-- 主版面-->
    <div class="main-panel" :style="{'transform': offset}"
         draggable="true"
         @dragstart="dragStart($event,tip.id)"
         @dragend="dragEnd($event, tip.id)"
         @dragover="dragOver($event, tip.id)"
         @dblclick="enterApp($event, tip.id)"
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
    <template v-if="upOffsetX > 0">
      <div class="left-draw"
           :style="{'z-index': upOffsetX >= barRect.width ? 1: -1, 'opacity': upOffsetX >= barRect.width * dragBackLimit ? 1: 0}">
        <div style="height: 100%">左侧 查看 清空</div>
        <slot name="left-draw"></slot>
      </div>
    </template>
    <!-- 右侧抽屉 -->
    <template v-else>
      <div class="right-draw"
           :style="{'z-index': upOffsetX <= -barRect.width ? 1: -1, 'opacity': upOffsetX < -barRect.width * dragBackLimit ? 1: 0}">
        <div>右侧 查看 清空</div>
        <slot name="right-draw"></slot>
      </div>
    </template>
  </div>
</template>

<script>

import MyIcon from "@/components/ndg/MyIcon";
import {blankEle, gradientSplit, inRegion} from "@/components/ndg/common/common";
import {Timer} from "@/components/ndg/timer";

export default {
  name: "TipBar",
  components: {MyIcon},
  data() {
    return {
      timer: new Timer(),
      startPos: {
        clientX: 0,
        clientY: 0,
      },
      // 上层 位移
      upOffsetX: 0,
      upOffsetY: 0,
      // 下层 位移
      btOffsetY: 0,
      btOffsetX: 0,
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
      default: 0.3
    }
  },
  mounted() {
    this.calcBarRect();
  },
  updated() {

  },
  computed: {
    offset() {
      return `translateX(${this.upOffsetX}px)`
    },
    overLimit() {
      if (this.upOffsetX == 0) {
        return false;
      }
      return Math.abs(this.upOffsetX) >= this.barRect.width * this.dragBackLimit
    },
  },
  watch: {},
  methods: {
    dragStart($event, tid) {
      $event.stopPropagation();
      $event.dataTransfer.effectAllowed = "move";
      $event.dataTransfer.setDragImage(blankEle, 0, 0)
      this.startPos.clientX = $event.clientX;
      this.startPos.clientY = $event.clientY;
      this.$emit('startDrag', tid)
    },
    dragOver($event, tid) {
      // 告诉父组件，tid以及现在鼠标的X位置
      // console.log('dragOver', '触发 dragAct', this.upOffsetX, $event.clientY, this.barRect.top)
      this.$emit('dragAct', $event.clientX)
    },
    //
    crossDragOver(clientX) {
      console.log('响应父组件的调用')
      this.upOffsetX = clientX - this.startPos.clientX
    },
    crossDragEnd() {

    },
    dragEnd($event, tid) {
      let linSpace = []
      // 位移长度不够，就返回原始位置
      if (this.tip.id == this.$parent.$data.dragId) {
        if (!this.overLimit) {               // 默认从大到小 如果是向左移动，就翻转一下数组
          linSpace = gradientSplit(this.upOffsetX, 0, 25, this.upOffsetX < 0)
        } else if (this.overLimit) {         // 位移长度足够，则自动进入到当前动作的末尾
          const barWidth = this.barRect.width;
          linSpace = gradientSplit(this.upOffsetX, this.upOffsetX > 0 ? barWidth : -1 * barWidth, 25, this.upOffsetX > 0)
        }
        // 一点点的拉过去
        for (let i = 0; i < linSpace.length; i++) {
          setTimeout(() => {
            this.upOffsetX = linSpace[i]
          }, 20 * i);
        }
      }
      this.$emit('dragEnd')
    },
    calcBarRect() {
      let bar = document.getElementsByClassName('main-panel')[0]
      if (bar) {
        this.barRect = bar.getBoundingClientRect()
        // console.log(this.barRect)
      }
    },
    enterApp($event, id) {
      this.$emit('enterApp', id)
    }
  }

}
</script>

<style scoped>
.tipbar {
  z-index: 0;
  color: black;
  height: 90%;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 15px 15px 15px 15px;
  user-select: none;
  position: relative;
  top: 50%;
  transform: translate(0%, -50%);
  transition: all 500ms ease-in-out;
  /* background-image: url("../../../assets/bottom.png");*/
  padding-left: 1%;
  padding-right: 1%;

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
}

</style>
