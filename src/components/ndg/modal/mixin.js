import { SHIFTACTION} from "@/components/ndg/common";

export default {
  methods: {
    bodyDragOver($event) {
      // console.log('与modal-body交互 dragOver')
      $event.stopPropagation();
      // 如果打开Modal，才能使能 @drop 有效果
      if (this.showModal) {
        $event.preventDefault();
      }

      // 拖出APP，不需要Drop，只需要等over的时间到了，就启动以下代码

      let overTime = this.modalSuspendTimer.time > 500
      if (this.modalActOcaasion == SHIFTACTION.ShiftIntoModal && overTime) {
        // NOOP 拖入的情况，则什么也不做 no operation
      } else if (this.modalActOcaasion == SHIFTACTION.ShiftOutModal && overTime) {
        console.log('开关Modal', this.modalSuspendTimer.time)
        this.toggle(SHIFTACTION.ShiftOutModal);
        // 已经退出可以关掉计时器
        this.modalSuspendTimer.shutdown();
        // 发送给桌面（上级组件），让他知道被拖拽的是个什么APP，并且告知这是一个modal框拖出的事件
        // 响应给 上级组件的混入代码：outer.js，做出相应插入或者并入
        this.$emit('shiftOutFromModal', this.draggingIndex.groupIndex, this.draggingIndex.appIndex)
      }
    },
    bodyDragEnter($event) {
      console.log('与div.modal-body交互 dragEnter')
      this.modalSuspendTimer.start();
    },
    bodyDragLeave($event) {
      console.log('与div.modal-body交互 dragLeave')
      this.modalSuspendTimer.shutdown();
    },

    bodyDrop($event) {
      $event.stopPropagation();
      let displayNum = this.box.displayNum;
      console.log('drop落在modal-body中', displayNum)

      // 拖入APP
      if (this.modalActOcaasion == SHIFTACTION.ShiftIntoModal) {
        // 把被拖拽的APP 追加放入BOX中的一组中
        const isFull = this.box.appGroups[displayNum].length >= 9;
        if (!isFull) {
          this.$emit('shiftIntoModal', displayNum)
        }
      }
      // 放入之后，要被认为是 拉出模式，这样悬停可以退出模态框
      this.modalActOcaasion = SHIFTACTION.ShiftOutModal
    },
  }
}
