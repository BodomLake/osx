import {DESKTOP} from "@/components/ndg/common"

export default {
  name: 'inner',
  data() {
    return {}
  },
  methods: {
    boxStartDrag($event, deskIndex, boxIndex) {
      console.info('开始拖拽:drag-start', deskIndex, boxIndex)
      if (this.appCounter(deskIndex, boxIndex) == 0) {
        $event.preventDefault()
        return
      }
      this.isDragging = true
      $event.stopPropagation()
      // 确认下标
      this.draggingIndex.deskIndex = deskIndex
      this.draggingIndex.boxIndex = boxIndex
      // 方格内显示几个app？
      let boxDisplayNum = this.desks[deskIndex].boxes[boxIndex].displayNum
      // 找到被拖拽的元素
      let dragShowElement = document.getElementsByClassName(DESKTOP)[deskIndex]
        .children[0].children[boxIndex].children[0].children[0].children[boxDisplayNum]
      // 设置好拖拽鼠标指示的内容
      $event.dataTransfer.effectAllowed = "link"
      // console.info(dragShowElement.clientHeight,dragShowElement.clientWidth)
      if (dragShowElement) {
        let w = dragShowElement.clientWidth / 2 + 43
        let h = dragShowElement.clientHeight / 2 + 36
        $event.dataTransfer.setDragImage(dragShowElement, w, h)
      }
    },
    boxDrag($event, deskIndex, boxIndex) {
      // console.info('drag', deskIndex, boxIndex)
    },
    // 放入盒子
    boxDrop($event, deskIndex, boxIndex) {
      console.info('drop', deskIndex, boxIndex)
      let targetBox = this.desks[deskIndex].boxes[boxIndex]
      this.targetIndex.deskIndex = deskIndex
      this.targetIndex.boxIndex = boxIndex
      let ddi = this.draggingIndex.deskIndex
      let dbi = this.draggingIndex.boxIndex
      console.info(deskIndex, boxIndex,
        targetBox.innerSuspendTimer.time, targetBox.outerSuspendTimer.time)
      let inDuration = this.inRegion(targetBox.innerSuspendTimer.time, this.suspendJudgeLimit, this.dragIntoTimeLimit)
      // 被拖拽的是单个app
      let isSingleApp = this.appCounter(ddi, dbi) == 1
      // 时间在设定区间之内，并且被拖拽的单独的app，这样才可以把被拖拽的app放入
      if (inDuration && isSingleApp) {
        let draggedBox = this.desks[ddi].boxes.splice(dbi, 1)[0]
        console.info(draggedBox)
        let insertedApp = {
          name: draggedBox.appGroups[0][0].name,
          id: draggedBox.appGroups[0][0].id,
        }
        targetBox.appGroups[targetBox.displayNum].push(insertedApp)
        targetBox.covered = false;
      }
      console.log('inner.js 重置 目标BOX计时器')
      targetBox.innerSuspendTimer.shutdown()
      targetBox.outerSuspendTimer.shutdown()
    },
    boxDragEnter($event, deskIndex, boxIndex) {
      $event.stopPropagation()
      $event.preventDefault()
      console.info('drag-enter拖入', deskIndex, boxIndex, $event.target)
      let notSelf = this.draggingIndex.deskIndex != deskIndex || this.draggingIndex.boxIndex != boxIndex
      let box = this.desks[deskIndex].boxes[boxIndex]
      if (notSelf) {
        // TODO 要注意的是：鼠标从外框进入内框，需要暂停 outerSuspendTimer 的计时
        console.info("box内框开始计时")
        box.innerSuspendTimer.start()
        // 暂停外框交界计时
        box.outerSuspendTimer.pause()
      }
    },
    // 离开内部盒子
    boxDragLeave($event, deskIndex, boxIndex) {
      $event.stopPropagation()
      $event.preventDefault()
      console.info('drag-leave拖出', deskIndex, boxIndex, $event.target)
      // 离开内部，鼠标移动至外部，外部重新开始计时
      this.desks[deskIndex].boxes[boxIndex].outerSuspendTimer.restart()
      this.desks[deskIndex].boxes[boxIndex].covered = false
    },
    // 当前拖拽结束
    boxDragEnd($event, deskIndex, boxIndex) {
      this.isDragging = false
      console.info('drag-end', deskIndex, boxIndex)
      // this.desks[deskIndex].boxes[boxIndex].outerSuspendTimer.shutdown()
      let box = this.desks[deskIndex].boxes[boxIndex]
      if (box) {
        box.innerSuspendTimer.shutdown()
      }
    },
    // 交互转移
    boxDragOver($event, deskIndex, boxIndex) {
      $event.preventDefault()
      $event.stopPropagation()
      this.targetIndex.deskIndex = deskIndex
      this.targetIndex.boxIndex = boxIndex
      let bi = this.draggingIndex.boxIndex
      let di = this.draggingIndex.deskIndex
      // 从draggingIndex的原始位置为参照物，判断鼠标移动方向
      this.deterMouseMove($event)
      console.info("定位到", this.targetIndex.deskIndex, this.targetIndex.boxIndex)
      let box = this.desks[deskIndex].boxes[boxIndex]
      // 判定是否在rect范围之内
      if (deskIndex == di && boxIndex == bi) {
        // console.info('自交dragover')
        return
      } else {
        console.info('innerSuspendTimer inner层计时:', box.innerSuspendTimer.time)
        if (this.inRegion(box.innerSuspendTimer.time, this.suspendJudgeLimit, this.dragIntoTimeLimit)) {
          console.info('boxDragOver-开始放大，修改covered状态')
          box.covered = true
          // 提前锁定modal的坐标，加以渲染，这样接下来打开就不会有卡顿；
          this.modal.deskIndex = deskIndex
          this.modal.boxIndex = boxIndex
        } else if (box.innerSuspendTimer.time > 500 && this.$refs["modal"].$data['showModal'] == false) {
          box.covered = false
          let appCount = this.appCounter(deskIndex, boxIndex)
          if (appCount > 1 || dragInto == true) {
            window.setTimeout(() => {
              box.innerSuspendTimer.shutdown()
              box.innerSuspendTimer.shutdown()
              this.$refs["modal"].toggle()
            }, 10)
          }
          console.info('boxDragOver-开始打开modal，给被拖拽的元素放入的机会')
        }
      }
    },
  }
}
