import {desks} from "@/components/ndg/app";

export default {
  draggingBox(state, getters) {
    return {}
  },
  checkedBox(state, getters) {
    return desks[state.modalIndex.deskIndex].boxes[state.modalIndex.boxIndex]
  },
  checkedBoxIndex(state, getters) {
    return {
      deskIndex: state.deskIndex,
      boxIndex: state.boxIndex,
      groupIndex: state.groupIndex,
      appIndex: state.appIndex,
    }
  }
}
