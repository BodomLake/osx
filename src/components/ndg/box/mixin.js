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
      this.$store.commit('setDraggingIndex', {
        appIndex: appIndex,
        groupIndex: groupIndex,
        deskIndex: this.$parent.$props['modalIndex'].deskIndex,
        boxIndex: this.$parent.$props['modalIndex'].boxIndex,
      })
      $event.stopPropagation();
      console.log('appDragStart', $event.target)
      this.$store.commit('setDraggingDOM', $event.target);
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
      let aid = this.$store.state.draggingIndex.appIndex
      let gid = this.$store.state.draggingIndex.groupIndex
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
      this.$store.commit('setTargetIndex', {
        appIndex: appIndex,
        groupIndex: groupIndex,
      })
      let notSelf = this.$store.state.draggingIndex.appIndex != appIndex || this.$store.state.draggingIndex.groupIndex != groupIndex
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
      // 当前组，app的个数
      let appNum = this.appGroups[groupIndex].length;
      let di = this.$store.state.draggingIndex;
      let mi = this.$parent.$props['modalIndex'];
      let inSameModal = di.deskIndex == mi.deskIndex && di.boxIndex == mi.boxIndex
      if (isModalApp(this)) {
        // 如果拖拽是跨组的，就不用前置顺序
        let adjust = (groupIndex == this.$store.state.draggingIndex.groupIndex) ? -1 : 0;
        if (inSameModal) {
          // 同个Modal 内换动
          this.shiftApp(groupIndex, appNum + adjust);
        } else {
          // TODO 也可能是跨modal的调动
          this.$emit('shiftIntoModalFromOtherModal', groupIndex)
        }
      } else if (isDockApp(this) || isOuterBox(this) || isInnerBox(this)) {
        // DockBar或者桌面Boxes上来的
        this.$emit('shiftIntoModalFromDesk', groupIndex)
      }
    },
  }
}
