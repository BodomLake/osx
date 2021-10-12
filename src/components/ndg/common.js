export const PREFIX = "ndg-";
export const BACKGROUND = PREFIX + "background";
export const CONTAINER = PREFIX + "container";
export const CONTENT_BORDER = PREFIX + "content-border";
export const DESKTOP = PREFIX + 'desktop';
export const GROUP = PREFIX + "ndg-app-group";
export const APP = PREFIX + "app";
export const GROUPAPPLIMIT = 9;
// 拖拽行为划分
export const SHIFTACTION = {
  'BetweenDesk': 0,
  'ShiftIntoModal': 1,
  'ShiftOutModal': 2,
  'MoveToDock': 3,
  'RecFromDock': 4,
}

/**
 * 从下标arr[i2]自身开始向后删除，填充(...item)也就是arr[i1]，以数组形式返回被删掉的元素
 */
export function swapEle(arr, i1, i2) {
  arr[i1] = arr.splice(i2, 1, arr[i1])[0]
  return arr
}

/**
 * 根据区间和步长，划分出一个梯度数组
 * @param a
 * @param b
 * @param step
 * @returns {*[]}
 */
export function gradientSplit(a, b, step) {
  let min = Math.min(a, b)
  let max = Math.max(a, b)
  let arr = []
  arr.push(max)
  let start = Math.ceil(min)
  let end = Math.floor(max)
  if (!step) {
    step = 2
  }
  for (let i = end; i > start; i = i - step) {
    arr.push(i)
  }
  arr.push(min)
  // console.info(arr)
  return arr
}

// 默认在一秒（1000ms）之内
export function inRegion(val, a, b) {
  if (!a) {
    a = 0;
  }
  if (!b) {
    b = 1000;
  }
  let low = Math.min(a, b)
  let high = Math.max(a, b)
  return val >= low && val <= high;
}

/**
 * 决定鼠标动向
 * @param $event
 */
export function deterMouseMove($event) {
  let changeX = $event.clientX - this.mouse.x;
  let changeY = $event.clientY - this.mouse.y;

  if (changeX > 0) {
    this.mouse.orientation.hor = "right";
  } else if (changeX < 0) {
    this.mouse.orientation.hor = "left";
  }
  if (changeY < 0) {
    this.mouse.orientation.vet = "up";
  } else if (changeY > 0) {
    this.mouse.orientation.vet = "down";
  }
}

export function showEvent($event) {
  console.info(
    "offset",
    $event.offsetX,
    $event.offsetY,
    "client",
    $event.clientX,
    $event.clientY,
    "page",
    $event.pageX,
    $event.pageY,
    "screen",
    $event.screenX,
    $event.screenY
  )
}
