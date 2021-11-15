export const PREFIX = "ndg-";
export const BACKGROUND = PREFIX + "background";
export const CONTAINER = PREFIX + "container";
export const CONTENT_BORDER = PREFIX + "content-border";
export const OUTERBOX = PREFIX + "outer";
export const DESKTOP = PREFIX + 'desktop';
export const GROUP = PREFIX + "ndg-app-group";
export const APP = PREFIX + "app";
export const DOCKAPP = PREFIX + "dock-app";
export const GROUPAPPLIMIT = 9;

export function isDockApp(vue) {
  let dom = vue.$store.state.draggingDOM;
  // console.log(dom.classList)
  return dom.classList.contains(DOCKAPP)
}


export function isModalApp(vue) {
  let dom = vue.$store.state.draggingDOM;
  // console.log(dom.classList)
  return dom.classList.contains(APP)
}


export function isOuterBox(vue) {
  let dom = vue.$store.state.draggingDOM;
  // console.log(dom.classList)
  return dom.classList.contains(OUTERBOX)
}

export function isInnerBox(vue) {
  let dom = vue.$store.state.draggingDOM;
  // console.log(dom.classList)
  return dom.classList.contains(CONTENT_BORDER)
}

/**
 * 从下标arr[i2]自身开始向后删除，填充(...item)也就是arr[i1]，以数组形式返回被删掉的元素
 */
export function swapEle(arr, shiftedIndex, deletedIndex) {
  arr[shiftedIndex] = arr.splice(deletedIndex, 1, arr[shiftedIndex])[0]
  return arr
}

/**
 * 根据区间和步长，划分出一个梯度数组
 * 默认从大到小 max->min
 * @param a
 * @param b
 * @param step
 * @returns {*[]}
 */
export function gradientSplit(a, b, step, reverse) {
  let min = Math.min(a, b)
  let max = Math.max(a, b)
  let arr = []
  arr.push(max)
  let start = Math.ceil(min)
  let end = Math.floor(max)
  if (!step) {
    step = 1
  }
  for (let i = end; i > start; i = i - step) {
    arr.push(i)
  }
  arr.push(min)
  if (reverse) {
    arr.reverse();
  }
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

export const splitToGroup = (d, g, group) => {
  let sum = 0;
  for (let i = 0; i <= g; i++) {
    sum += group[i];
  }
  if (d > sum) {
    g++;
    g = splitToGroup(d, g, group)
  }
  return g;
}

// 按照一定的组大小，分组，也就是数组维度上升
export const splitArrayByGroup = (array, groupSize) => {
  return array.reduce((retArr, ele, idx, arr) => {
    // 第几轮？ 从0开始
    if ((idx + 1) % groupSize == 0 && idx < arr.length - 1) {
      retArr.push([])
    }
    retArr[Math.floor(idx / groupSize)].push(ele)
    return retArr
  }, [[]])
}

export const blankEle = document.createElement('span')
