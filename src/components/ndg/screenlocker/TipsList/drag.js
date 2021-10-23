import {blankEle, gradientSplit} from "@/components/ndg/common/common";

export default {
  name: 'upper',
  methods: {
    /**
     * 拉拽开始，定位鼠标位置
     * @param $event
     * @param tid
     */
    dragStart($event, tid) {
      $event.stopPropagation();
      $event.dataTransfer.effectAllowed = "move";
      $event.dataTransfer.setDragImage(blankEle, 0, 0)
      this.startPos.clientX = $event.clientX;
      this.startPos.clientY = $event.clientY;
      this.startPos.pageX = $event.pageX;
      this.startPos.pageY = $event.pageY;
      this.$emit('startDrag', tid, this.startPos)
    },
    dragOver($event, tid) {
      this.$emit('dragAct', $event.clientX, $event.clientY)
    },
    /**
     * 响应拉拽完成事件
     * @param $event
     * @param tid
     */
    dragEnd($event, tid) {
      let linSpace = []
      // 位移长度不够，就返回原始位置
      if (this.tip.id == this.$parent.$data.dragBarId) {
        if (!this.dragOut) {               // 默认从大到小 如果是向左移动，就翻转一下数组
          linSpace = gradientSplit(this.offsetX, 0, 30, this.offsetX < 0)
        } else if (this.dragOut) {         // 位移长度足够，则自动进入到当前动作的末尾
          const barWidth = this.calcBarRect().width;
          linSpace = gradientSplit(this.offsetX, this.offsetX > 0 ? barWidth : -barWidth, 25,
            this.offsetX > 0)
        }
        this.dragState.dragToRight = this.offsetX > 0
        this.dragState.dragToLeft = !this.dragState.dragToRight;
        // 一点点的拉过去
        for (let i = 0; i < linSpace.length; i++) {
          setTimeout(() => {
            this.offsetX = linSpace[i]
          }, 20 * i);
        }

      }
      this.$emit('dragEnd')
    },
    /**
     * 响应父组件使其本组件发生水平位移
     * @param clientX
     * @param clientY
     */
    crossDragOver(clientX, clientY) {
      // console.log('响应父组件的调用')
      // clientX是当前鼠标拖拽的横向位置
      let offset = clientX - this.startPos.clientX;
      if (this.dragState.dragToLeft) {
        offset -= this.barRect.width
      }
      if (this.dragState.dragToRight) {
        offset += this.barRect.width
      }
      this.offsetX = offset
    },
    /**
     * 响应父组件使其本组件发生水平位移
     * @param clientX
     * @param clientY
     */
    crossDragEnd() {

    },
  }
}
