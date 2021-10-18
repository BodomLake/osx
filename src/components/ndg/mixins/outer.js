import {isDockApp, isInnerBox, isModalApp, isOuterBox} from "../common/common";

export default {
  name: 'outer',
  data() {
    return {}
  },
  methods: {
    outerDragOver($event, deskIndex, boxIndex) {
      let dbi = this.$store.state.draggingIndex.boxIndex
      let ddi = this.$store.state.draggingIndex.deskIndex
      let box = this.desks[deskIndex].boxes[boxIndex]
      // 判定是否在rect范围之内
      if (deskIndex == ddi && boxIndex == dbi) {
        this.targetBOX.innerSuspendTimer.shutdown()
        this.targetBOX.outerSuspendTimer.shutdown()
        // console.info('自交dragover')
        return;
      } else {
        if (box.outerSuspendTimer.time >= 250) {
          // 交换BOX的位置
          if (isOuterBox(this) || isInnerBox(this)) {
            this.shiftBOX(deskIndex, boxIndex)
          } else if (isDockApp(this)) {
            // TODO Dockbar中的APP划入
          }
          box.outerSuspendTimer.shutdown()
        }
      }
    },
    /**
     * outerDragEnter 进入外层
     * @param $event
     * @param deskIndex
     * @param boxIndex
     */
    outerDragEnter($event, deskIndex, boxIndex) {
      $event.stopPropagation()
      $event.preventDefault()
      this.$store.commit('setTargetIndex', {
        deskIndex: deskIndex,
        boxIndex: boxIndex,
      })
      let notSelf = this.$store.state.draggingIndex.deskIndex != deskIndex || this.$store.state.draggingIndex.boxIndex != boxIndex;
      if (notSelf && isInnerBox(this)) {
        console.log('dragEnter', deskIndex, boxIndex, this.$store.state.draggingIndex.boxIndex)
        console.info("box外框开始计时")
        let box = this.desks[deskIndex].boxes[boxIndex]
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
        this.recoverTargetBox(deskIndex, boxIndex)
      }
    },
    /**
     * outerMouseEnter 外部：鼠标划入
     * @param $event
     * @param deskIndex
     * @param boxIndex
     */
    ome($event, deskIndex, boxIndex) {
      let isApp = this.appCounter(deskIndex, boxIndex) == 1
      if (!this.$refs["modal"].showModal && !isApp) {
        this.modalIndex.deskIndex = deskIndex;
        this.modalIndex.boxIndex = boxIndex;
        // console.log( deskIndex, boxIndex, this.$refs["modal"].$props['modalIndex'])
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
    recoverTargetBox(deskIndex, boxIndex) {
      this.desks[deskIndex].boxes[boxIndex].outerSuspendTimer.shutdown()
      this.desks[deskIndex].boxes[boxIndex].innerSuspendTimer.shutdown()
      this.desks[deskIndex].boxes[boxIndex].covered = false;
    }
  }
}
