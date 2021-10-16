export default {
  setDraggingDOM(state, dom) {
    // console.log('设置被拖的DOM: HTMLDivElement')
    state.draggingDOM = dom;
  },
  setTargetDOM(state, dom) {
    // console.log('设置目标的DOM: HTMLDivElement')
    state.targetDOM = dom;
  },
  setDraggingIndex(state, index) {
    Object.keys(state.draggingIndex).forEach(key => {
      if (index[key]) {
        state.draggingIndex[key] = index[key]
      }
    })
  },
  setTargetIndex(state, index) {
    // console.log('定位目标index')
    Object.keys(state.targetIndex).forEach(key => {
      if (index[key]) {
        state.targetIndex[key] = index[key]
      }
    })
  }
}
