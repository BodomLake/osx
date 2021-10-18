import {DESKTOP, inRegion, isInnerBox, isOuterBox} from "@/components/ndg/common/common"

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
      // 定位坐标
      this.$store.commit('setDraggingIndex', {
        deskIndex: deskIndex,
        boxIndex: boxIndex,
        // 默认为0 0 ，默认被拖拽的是单app，或者
        groupIndex: 0,
        appIndex: 0
      })
      // 定位被拖拽的DOM元素
      this.$store.commit('setDraggingDOM', $event.target);

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
      this.$store.commit('setTargetIndex', {
        deskIndex: deskIndex,
        boxIndex: boxIndex,
      })
      let ddi = this.$store.state.draggingIndex.deskIndex
      let dbi = this.$store.state.draggingIndex.boxIndex
      console.info(deskIndex, boxIndex, targetBox.innerSuspendTimer.time, targetBox.outerSuspendTimer.time)
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
      let notSelf = this.$store.state.draggingIndex.deskIndex != deskIndex || this.$store.state.draggingIndex.boxIndex != boxIndex
      if (notSelf) {
        let box = this.desks[deskIndex].boxes[boxIndex]
        // TODO 要注意的是：鼠标从外框进入内框，需要暂停 outerSuspendTimer 的计时
        console.info("box内框开始计时")
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
      let setPosition = () => {
        this.$store.commit('setTargetIndex', {
          deskIndex: deskIndex,
          boxIndex: boxIndex,
        })
        this.modalIndex.deskIndex = deskIndex;
        this.modalIndex.boxIndex = boxIndex;
      }
      let dbi = this.$store.state.draggingIndex.boxIndex
      let ddi = this.$store.state.draggingIndex.deskIndex
      let box = this.desks[deskIndex].boxes[boxIndex]
      // 判定是否在rect范围之内,被拖拽的盒子内含app数量也不可以大于1，大于1属于文件夹，只能移动位置；
      const selfCover = (deskIndex == ddi && boxIndex == dbi);
      // 被拖拽的是本来做出上一个状态的时候就是桌面BOX，并且该BOX要是内涵APP数量大于1，就不能让他对目标有悬停放大的效果
      // 被拖拽的只能是桌面上单个APP，以及DOCKAPP，还有Modal-BOX内部单个APP
      const draggedIsFolderInDesk = this.appCounter(ddi, dbi) > 1 && (isOuterBox(this) || isInnerBox(this));
      console.info("定位到目标盒子", deskIndex, boxIndex, box.innerSuspendTimer.time, ddi, dbi)
      if (selfCover || draggedIsFolderInDesk) {
        return;
      }
      // 第一步，准备拖入放大BOX，也就是准备打开Modal
      const step1 = inRegion(box.innerSuspendTimer.time, this.suspendJudgeLimit, this.dragIntoTimeLimit)
      // 第二部，时间超过界限，打开Modal框
      const step2 = box.innerSuspendTimer.time > 500 && this.$refs["modal"].$data['showModal'] == false
      if (step1 && box.covered == false) {
        box.covered = true
        setPosition();
      } else if (step2) {
        setPosition()
        box.covered = false
        window.setTimeout(() => {
          box.innerSuspendTimer.shutdown()
          box.innerSuspendTimer.shutdown()
          this.$refs["modal"].toggle()
        }, 5)
        console.info('boxDragOver-开始打开modal，给被拖拽的元素放入')
      }
    },
  }
}
