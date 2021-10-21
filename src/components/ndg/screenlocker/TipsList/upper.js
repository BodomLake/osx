import {blankEle, gradientSplit} from "@/components/ndg/common/common";

export default {
  name: 'upper',
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
      this.$emit('dragAct', $event.clientX)
    },
    dragEnd($event, tid) {
      let linSpace = []
      // 位移长度不够，就返回原始位置
      if (this.tip.id == this.$parent.$data.dragBarId) {
        if (!this.dragOut) {               // 默认从大到小 如果是向左移动，就翻转一下数组
          linSpace = gradientSplit(this.upOffsetX, 0, 30, this.upOffsetX < 0)
        } else if (this.dragOut) {         // 位移长度足够，则自动进入到当前动作的末尾
          const barWidth = this.calcBarRect().width;
          linSpace = gradientSplit(this.upOffsetX, this.upOffsetX > 0 ? barWidth : -barWidth, 25,
            this.upOffsetX > 0)
        }
        this.dragState.dragToRight = this.upOffsetX > 0
        this.dragState.dragToLeft = !this.dragState.dragToRight;
        // 一点点的拉过去
        for (let i = 0; i < linSpace.length; i++) {
          setTimeout(() => {
            this.upOffsetX = linSpace[i]
          }, 20 * i);
        }

      }
      this.$emit('dragEnd')
    },
  }
}
