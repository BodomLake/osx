import {DESKTOP, inRegion, SHIFTACTION} from "@/components/ndg/common"

export default {
  name: 'inner',
  data() {
    return {}
  },
  methods: {
    boxStartDrag($event, deskIndex, boxIndex) {
      console.info('开始拖拽:drag-start', $event.target, deskIndex, boxIndex)
      if (this.appCounter(deskIndex, boxIndex) == 0) {
        $event.preventDefault()
        return
      }
      this.isDragging = true
      $event.stopPropagation()
      // 定义为dragIntoModal或者
      this.shiftAction = SHIFTACTION.BetweenDesk;
      // 定位坐标
      this.draggingIndex.deskIndex = deskIndex
      this.draggingIndex.boxIndex = boxIndex
      // 默认为0 0 ，默认被拖拽的是单app，或者
      this.draggingIndex.groupIndex = 0
      this.draggingIndex.appIndex = 0

      // 方格内显示几个app？
      let boxDisplayNum = this.desks[deskIndex].boxes[boxIndex].displayNum
      // 找到被拖拽的元素
      let dragShowElement = document.getElementsByClassName(DESKTOP)[deskIndex]
        .children[0].children[boxIndex].children[0].children[0].children[boxDisplayNum]
      // 设置好拖拽鼠标指示的内容
      $event.dataTransfer.effectAllowed = "link"
      if (dragShowElement) {
        let w = dragShowElement.clientWidth / 2 + 20
        let h = dragShowElement.clientHeight / 2 + 20
        $event.dataTransfer.setDragImage(dragShowElement, w, h)
      }
    },
    boxDrag($event, deskIndex, boxIndex) {
      // console.info('drag', deskIndex, boxIndex)
    },
    boxDrop($event, deskIndex, boxIndex) {
      console.info('drop', deskIndex, boxIndex)
      let targetBox = this.desks[deskIndex].boxes[boxIndex]
      this.targetIndex.deskIndex = deskIndex
      this.targetIndex.boxIndex = boxIndex
      let ddi = this.draggingIndex.deskIndex
      let dbi = this.draggingIndex.boxIndex
      console.info(deskIndex, boxIndex,
        targetBox.innerSuspendTimer.time, targetBox.outerSuspendTimer.time)
      let inDuration = inRegion(targetBox.innerSuspendTimer.time, this.suspendJudgeLimit, this.dragIntoTimeLimit)
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
      targetBox.innerSuspendTimer.shutdown()
      targetBox.outerSuspendTimer.shutdown()
    },
    boxDragEnter($event, deskIndex, boxIndex) {
      $event.stopPropagation()
      $event.preventDefault()
      let notSelf = this.draggingIndex.deskIndex != deskIndex || this.draggingIndex.boxIndex != boxIndex
      let box = this.desks[deskIndex].boxes[boxIndex]
      if (notSelf) {
        // TODO 要注意的是：鼠标从外框进入内框，需要暂停 outerSuspendTimer 的计时
        console.info("box内框开始计时", $event.target)
        box.innerSuspendTimer.start()
        // 暂停外框交界计时
        box.outerSuspendTimer.pause()
      }
    },
    boxDragLeave($event, deskIndex, boxIndex) {
      $event.stopPropagation()
      $event.preventDefault()
      // 离开内部，鼠标移动至外部，外部重新开始计时
      this.desks[deskIndex].boxes[boxIndex].outerSuspendTimer.restart()
      this.desks[deskIndex].boxes[boxIndex].covered = false
    },
    boxDragEnd($event, deskIndex, boxIndex) {
      this.isDragging = false
      console.info('drag-end', deskIndex, boxIndex)
      // this.desks[deskIndex].boxes[boxIndex].outerSuspendTimer.shutdown()
      let box = this.desks[deskIndex].boxes[boxIndex]
      if (box) {
        box.innerSuspendTimer.shutdown()
      }
    },
    boxDragOver($event, deskIndex, boxIndex) {
      $event.preventDefault()
      $event.stopPropagation()
      this.targetIndex.deskIndex = deskIndex
      this.targetIndex.boxIndex = boxIndex
      let dbi = this.draggingIndex.boxIndex
      let ddi = this.draggingIndex.deskIndex
      let box = this.desks[deskIndex].boxes[boxIndex]
      // 判定是否在rect范围之内,被拖拽的盒子内含app数量也不可以大于1，大于1属于文件夹，只能移动位置；
      const selfCover = (deskIndex == ddi && boxIndex == dbi);
      const isFolder = this.appCounter(ddi, dbi) > 1 && this.shiftAction != SHIFTACTION.ShiftOutModal
      console.info("定位到", deskIndex, boxIndex, box.innerSuspendTimer.time, ddi, dbi)
      if (selfCover || isFolder) {
        return;
      }
      // 第一步，准备拖入放大BOX，也就是准备打开Modal
      const step1 = inRegion(box.innerSuspendTimer.time, this.suspendJudgeLimit, this.dragIntoTimeLimit)
      // 第二部，时间超过界限，打开Modal框
      const step2 = box.innerSuspendTimer.time > 500 && this.$refs["modal"].$data['showModal'] == false
      if (step1 && box.covered == false) {
        box.covered = true
        this.modal.deskIndex = deskIndex
        this.modal.boxIndex = boxIndex
      } else if (step2) {
        box.covered = false
        window.setTimeout(() => {
          box.innerSuspendTimer.shutdown()
          box.innerSuspendTimer.shutdown()
          // 给Modal设置为锁定状态，并且打开modal框
          this.$refs["modal"].toggle(SHIFTACTION.ShiftIntoModal)
        }, 5)
        console.info('boxDragOver-开始打开modal，给被拖拽的元素放入')
      }
    },
  }
}
