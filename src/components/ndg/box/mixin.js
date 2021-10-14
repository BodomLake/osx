import {APP, DOCKAPP, isDockApp, isInnerBox, isModalApp, isOuterBox, OUTERBOX} from "@/components/ndg/common";

export default {
  methods: {
    /**
     *
     * @param $event
     * @param groupIndex
     * @param appIndex
     */
    appDragStart($event, groupIndex, appIndex) {
      this.draggingIndex.appIndex = appIndex;
      this.draggingIndex.groupIndex = groupIndex;
      // 确定被拖拽APP的定位信息
      if (this.appliedInModal) {
        this.$emit('draggingIndexChange', groupIndex, appIndex);
      }
      $event.stopPropagation();
      console.log('appDragStart', $event.target)
      this.$store.commit('setDraggingDOM', $event.target);
      // 设置好拖拽鼠标指示的内容
      // $event.dataTransfer.effectAllowed = "link";
    },
    /**
     *
     * @param $event
     * @param groupIndex
     * @param appIndex
     */
    appDragOver($event, groupIndex, appIndex) {
      $event.stopPropagation();
      $event.preventDefault();
      let aid = this.draggingIndex.appIndex
      let gid = this.draggingIndex.groupIndex
      let app = this.appGroups[groupIndex][appIndex];
      // 判定是否在rect范围之内
      if (groupIndex == gid && appIndex == aid) {
        app.suspendTimer.shutdown()
        return;
      } else {
        console.info('appSuspendTimer层计时', app.suspendTimer.time, 'ms', groupIndex, appIndex)
        if (app.suspendTimer.time >= 300) {
          this.shiftApp(groupIndex, appIndex)
          app.suspendTimer.shutdown()
        }
      }
    },
    /**
     *
     * @param $event
     * @param groupIndex
     * @param appIndex
     */
    appDragLeave($event, groupIndex, appIndex) {
      if (!this.appliedInModal) {
        return;
      }
      this.appGroups[groupIndex][appIndex].suspendTimer.shutdown();
    },
    /**
     * 进入鼠标划入，开始计时
     * @param $event
     * @param groupIndex
     * @param appIndex
     */
    appDragEnter($event, groupIndex, appIndex) {
      if (!this.appliedInModal) {
        return;
      }
      this.targetIndex.appIndex = appIndex
      this.targetIndex.groupIndex = groupIndex
      let notSelf = this.draggingIndex.appIndex != appIndex || this.draggingIndex.groupIndex != groupIndex
      if (notSelf) {
        this.appGroups[groupIndex][appIndex].suspendTimer.start();
      }
    },
    appDrop($event, groundIndex, appIndex) {
      $event.stopPropagation();
    },
    /**
     * restZoneDragOver
     * @param $event
     * @param deskIndex
     */
    restZoneDragOver($event, groupIndex) {
      if (this.appliedInModal) {
        $event.preventDefault();
      } else {
        return;
      }
    },
    /**
     * 落入空闲区域
     * @param $event
     * @param deskIndex
     */
    restZoneDrop($event, groupIndex) {
      // 要传导给父级组件，使其响应落入；
      // $event.stopPropagation();
      console.log('drop落在BOX中', groupIndex, this.appliedInModal, $event.target.classList)
      if (!this.appliedInModal) {
        return;
      }
      let appNum = this.appGroups[groupIndex].length;
      if (isModalApp(this)) {
        // 如果拖拽是跨组的，就不用前置顺序
        let adjust = (groupIndex == this.draggingIndex.groupIndex) ? -1 : 0;
        console.log('<Box></Box> restZoneDrop落入')
        this.shiftApp(groupIndex, appNum + adjust);
      } else if (isDockApp(this) || isOuterBox(this) || isInnerBox(this)) {
        this.$emit('shiftIntoModal', groupIndex)
      }
    },
  }
}
