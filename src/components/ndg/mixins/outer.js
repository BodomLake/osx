import {SHIFTACTION} from "@/components/ndg/common";

export default {
  name: 'outer',
  data() {
    return {}
  },
  methods: {
    outerDragOver($event, deskIndex, boxIndex) {
      let dbi = this.draggingIndex.boxIndex
      let ddi = this.draggingIndex.deskIndex
      console.info(deskIndex, boxIndex)
      let box = this.desks[deskIndex].boxes[boxIndex]
      // 判定是否在rect范围之内
      if (deskIndex == ddi && boxIndex == dbi) {
        this.targetBOX.innerSuspendTimer.shutdown()
        this.targetBOX.outerSuspendTimer.shutdown()
        // console.info('自交dragover')
        return;
      } else {
        // console.info('outerSuspendTimer outer层计时', box.outerSuspendTimer.time)
        if (box.outerSuspendTimer.time >= 250) {
          // 交换BOX的位置
          if (this.shiftAction == SHIFTACTION.BetweenDesk) {
            this.shiftBOX(deskIndex, boxIndex)
          } else if (this.shiftAction == SHIFTACTION.ShiftOutModal || this.shiftAction == SHIFTACTION.RecFromDock) {
            // noop
            // this.insertNewBOX(deskIndex, boxIndex)
          }
          box.outerSuspendTimer.shutdown()
        }
      }
    },
    outerDragEnter($event, deskIndex, boxIndex) {
      $event.stopPropagation()
      $event.preventDefault()
      this.targetIndex.deskIndex = deskIndex
      this.targetIndex.boxIndex = boxIndex
      let notSelf = this.draggingIndex.deskIndex != deskIndex || this.draggingIndex.boxIndex != boxIndex
      let box = this.desks[deskIndex].boxes[boxIndex]
      // console.info('drag-enter拖入', deskIndex, boxIndex, $event.target)

      if (notSelf) {
        console.info("box外框开始计时")
        // TODO 要注意的是：鼠标从内框进入外框，需要暂停 innerSuspendTimer 的计时
        box.outerSuspendTimer.start()
        box.innerSuspendTimer.pause()
      }
    },
    /**
     * outerDragLeave 拖拽中，鼠标离开outer 中断例外所有的计时
     * @param $event
     * @param deskIndex
     * @param boxIndex
     */
    outerDragLeave($event, deskIndex, boxIndex) {
      let box = this.desks[deskIndex].boxes[boxIndex]
      if (box) {
        box.outerSuspendTimer.shutdown()
      }
    },
    /**
     * outerDragEnd 外部：拖拽结束
     * @param $event
     * @param deskIndex
     * @param boxIndex
     */
    outerDragEnd($event, deskIndex, boxIndex) {
      // 拖拽结束了，修改标志
      this.isDragging = false
      let box = this.desks[deskIndex].boxes[boxIndex]
      if (box) {
        box.outerSuspendTimer.shutdown()
      }
    },
    /**
     * 落入框框
     * @param $event
     * @param deskIndex
     * @param boxIndex
     */
    outerDrop($event, deskIndex, boxIndex) {
      let box = this.desks[deskIndex].boxes[boxIndex]
      console.log('outer-drop')
      if (box) {
        this.desks[deskIndex].boxes[boxIndex].outerSuspendTimer.shutdown()
        this.desks[deskIndex].boxes[boxIndex].innerSuspendTimer.shutdown()
        this.desks[deskIndex].boxes[boxIndex].covered = false;
      }
    },
    /**
     * outerMouseEnter 外部：鼠标划入
     * @param $event
     * @param deskIndex
     * @param boxIndex
     */
    ome($event, deskIndex, boxIndex) {
      let appGroups = this.desks[deskIndex].boxes[boxIndex].appGroups
      let appCount = this.appCounter(deskIndex, boxIndex)
      let isApp = appGroups.length == 1 && appCount == 1
      if (!this.$refs["modal"].showModal && !isApp) {
        this.modal.deskIndex = deskIndex
        this.modal.boxIndex = boxIndex
      }
    },
    /**
     * outerMouseLeave 外部：鼠标划出
     * @param $event
     * @param deskIndex
     * @param boxIndex
     */
    oml($event, deskIndex, boxIndex) {
      // 离开就
      // this.desks[deskIndex].boxes[boxIndex].outerSuspendTime = 0
    },
  }
}
