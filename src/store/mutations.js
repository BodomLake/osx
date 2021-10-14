export default {
  setDraggingDOM(state, dom) {
    console.log('设置被拖的DOM')
    state.draggingDOM = dom;
  },
  setTargetDOM(state, dom) {
    console.log('设置目标的DOM')
    state.targetDOM = dom;
  }
}
