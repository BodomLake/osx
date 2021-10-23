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
      this.timer.start(10);
      this.scrolling = true;
    },
    dragOver($event, tid) {
      // console.log('用时：', tid)
      // console.log(this.timer.time, this.startPos.clientX, this.startPos.clientY, $event.clientX, $event.clientY)
      // console.log('δX', $event.clientX - this.startPos.clientX, 'δy', $event.clientY - this.startPos.clientY)
      let deltaX = Math.abs($event.clientX - this.startPos.clientX)
      let deltaY = Math.abs($event.clientY - this.startPos.clientY)
      // 如果大于50的时候，

      if (this.timer.time >= 10) {
        // 计算拖拽之后50ms内的位移方向，判断纵向还是横向拖拽
        console.log(this.horzDrag ? '横向' : '纵向')
        this.horzDrag = deltaX >= deltaY
        this.$emit('dragAct', this.horzDrag)
        this.timer.shutdown();
      }
      // 如果是横向位移
      if (this.horzDrag && this.tip.id == this.$parent.$data.dragBarId) {
        let offset = $event.clientX - this.startPos.clientX;
        this.offsetX = offset;
      }

    },
    /**
     * 响应拉拽完成事件
     * @param $event
     * @param tid
     */
    dragEnd($event, tid) {
      this.timer.shutdown();
      this.scrolling = false;
      // 位移长度不够，就返回原始位置
      if (this.tip.id == this.$parent.$data.dragBarId) {
        // 超出既定范围
        let dragOut = Math.abs(this.offsetX) >= this.barRect.width * this.dragBackLimit
        console.log(dragOut, this.offsetX, this.barRect.width * this.dragBackLimit)
        if (!dragOut) {
          this.baseOffsetX = 0
          this.offsetX = 0
        } else if (dragOut) {         // 位移长度足够，则自动进入到当前动作的末尾
          const barWidth = this.calcBarRect().width;
          this.baseOffsetX = this.offsetX > 0 ? barWidth : -barWidth
          this.offsetX = 0
        }
      }
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
