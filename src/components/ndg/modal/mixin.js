import {isDockApp, isInnerBox, isModalApp, isOuterBox} from "@/components/ndg/common";

export default {
  methods: {
    bodyDragEnter($event) {
      console.log('与div.modal-body交互 dragEnter')
      this.modalSuspendTimer.start();
    },
    bodyDragLeave($event) {
      console.log('与div.modal-body交互 dragLeave')
      this.modalSuspendTimer.shutdown();
    },
    bodyDragOver($event) {
      console.log('与modal-body交互 dragOver', 'isModalApp', isModalApp(this))
      $event.stopPropagation();
      // 如果打开Modal，才能使能 @drop 有效果
      if (this.showModal) {
        $event.preventDefault();
      }
      // 拖出APP，不需要Drop，只需要等over的时间到了，就启动以下代码
      let overTime = this.modalSuspendTimer.time > 500
      let di = this.$store.state.draggingIndex;
      const inSameModal = di.deskIndex == this.modalIndex.deskIndex && di.boxIndex == this.modalIndex.boxIndex
      if (!isModalApp(this) && overTime) {
        // NOOP 拖入的情况，则什么也不做 no operation
      } else if (isModalApp(this) && overTime) {
        console.log('开关Modal', this.modalSuspendTimer.time)
        console.log('inSameModal', inSameModal, 'dragIndex', di, 'modalIndex',this.modalIndex)
        // 发送给桌面（上级组件），让他知道被拖拽的是个什么APP，并且告知这是一个modal框拖出的事件
        // 响应给 上级组件的混入代码：outer.js，做出相应插入或者并入
        this.$emit('shiftOutFromModal', di.groupIndex, di.appIndex)
        // 已经退出可以关掉计时器
        this.modalSuspendTimer.shutdown();
        // 如果被拖拽的APP不是同一个Modal，关掉
        if (inSameModal) {
          this.toggle();
        }
      }
    },
    bodyDrop($event) {
      $event.stopPropagation();
      let displayNum = this.box.displayNum;
      console.log('drop落在modal-body中组号：', displayNum, '是ModalAPP:', isModalApp(this))
      const isFull = this.box.appGroups[displayNum].length >= 9;

      let di = this.$store.state.draggingIndex;
      let inSameModal = di.deskIndex == this.modalIndex.deskIndex && di.boxIndex == this.modalIndex.boxIndex
      // 拖入APP
      if (isOuterBox(this) || isInnerBox(this) || isDockApp(this) && !isFull) {
        // 把被拖拽的APP 追加放入BOX中的一组中
        this.$emit('shiftIntoModalFromDesk', displayNum)
      } else if (isModalApp(this) && !isFull) {
        // 被拖拽的 当前BOX或者其他BOX所属 modal的内部APP，相当于这可能是跨组(Folder)调动
        if (!inSameModal) {
          this.$emit('shiftIntoModalFromOtherModal', displayNum)
        } else {
          //  同一个modal内部
          // this.shiftApp()
        }
      }
    },
  }
}
