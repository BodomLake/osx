import { desks } from "../app.js";
import { BACKGROUND, CONTAINER, DESKTOP } from "../common.js";

export default {
  // 初始化 二维数组
  beforeCreate() {},
  updated() {
    console.log("updated--渲染完毕");
    if (this.updatedTimer) {
      clearTimeout(this.updatedTimer);
    }
    this.updatedTimer = setTimeout(() => {
      // 重置所有
      this.locateBOX();
      // console.log("重定位div.ndg-outer完毕, 不重置悬停状态");
    }, 300);
  },
  data() {
    return {
      desks,
      // 当前指向的桌面序号
      currentDeskNo: 0,
      // 每个BOX每页限制显示数量的上限
      // groupAppLimit: GROUPAPPLIMIT,
      // 切换桌面所需要的时间（transition动画时间）
      switchDeskTime: 500,
      updatedTimer: {}
    };
  },
  model: {
    value: "desks",
    event: "changeDesk"
  },
  computed: {
    // 计算桌面总宽度
    deskWidth() {
      return desks.length * 100 + "%";
    },
    deskShiftOffset() {
      return 100 / desks.length;
    }
  },
  watch: {},
  //
  methods: {
    // 初始化BOX的定位和尺寸
    initBOX() {
      let containers = document.querySelectorAll("." + CONTAINER);
      containers.forEach((cont, cid) => {
        let boxes = cont.children;
        Array.from(boxes).forEach((box, bid) => {
          let contentRect = box.children[0].getBoundingClientRect();
          // 外部 ndg-outer
          let outerRect = box.getBoundingClientRect();
          this.$set(this.desks[cid].boxes[bid], "DOMRect", contentRect);
          this.$set(this.desks[cid].boxes[bid], "outerDOMRect", outerRect);
          // 该盒子显示的
          this.$set(this.desks[cid].boxes[bid], "displayNo", 0);
          // 是否以模态框的形式打开模态框
          this.$set(this.desks[cid].boxes[bid], "showModal", false);
          // 该BOX是否被拖拽物覆盖
          this.$set(this.desks[cid].boxes[bid], "covered", false);
          // 在ndg-content-border之内的悬停时长
          this.$set(this.desks[cid].boxes[bid], "innerSuspendTime", 0);
          // 在ndg-outer和ndg-content-border之间的悬停时间
          this.$set(this.desks[cid].boxes[bid], "outerSuspendTime", 0);
        });
        let restSpace = this.calcRestSpace(cont, boxes);
        this.$set(this.desks[cid], "restSpace", restSpace);
      });
    },
    // 仅仅是定位BOX
    // 疑难点：DOM刷新总是 滞后于 数据更新，所以要根据数据来（计算，定义，更新）DOM的新属性。（初始化的情况除外）
    locateBOX() {
      // 因为数据(this.data)的更新优先于DOM的更新，所以循环数据，然后在定位相应的DOM，进而获取DOM的相关信息
      this.desks.forEach((desk, did) => {
        desk.boxes.forEach((box, bid) => {
          let boxDOM = document.querySelectorAll("." + CONTAINER)[did].children[
            bid
          ];
          // 内部 ndg-outer-border
          let contentRect = boxDOM.children[0].getBoundingClientRect();
          // 外部 ndg-outer
          let outerRect = boxDOM.getBoundingClientRect();
          box.DOMRect = contentRect;
          box.outerDOMRect = outerRect;
        });
        let contDOM = document.querySelectorAll("." + CONTAINER)[did];
        desk.restSpace = this.calcRestSpace(contDOM, contDOM.children);
      });
    },
    // 重置BOX 高宽尺寸 以及所有的悬停状态
    resetBOX() {
      this.desks.forEach((desk, did) => {
        desk.boxes.forEach((box, bid) => {
          let boxDOM = document.querySelectorAll("." + CONTAINER)[did].children[
            bid
          ];
          // 内部 ndg-outer-border
          let contentRect = boxDOM.children[0].getBoundingClientRect();
          // 外部 ndg-outer
          let outerRect = boxDOM.getBoundingClientRect();
          box.DOMRect = contentRect;
          box.outerDOMRect = outerRect;
          box.covered = false;
          // box.showModal = false;
          box.innerSuspendTime = 0;
          box.outerSuspendTime = 0;
          // box.displayNo = 0;
          boxDOM.children[0].style.transform = "";
        });
        let contDOM = document.querySelectorAll("." + CONTAINER)[did];
        desk.restSpace = this.calcRestSpace(contDOM, contDOM.children);
      });
    },
    // 让 ndg-content-border 正方形化，重新分配高宽
    square() {
      let containers = document.querySelectorAll("." + CONTAINER);
      containers.forEach((cont, cid) => {
        let boxes = cont.children;
        Array.from(boxes).forEach((box, bid) => {
          box.children[0].style.transform = "";
          let contentRect = box.children[0].getBoundingClientRect();
          let outerRect = box.getBoundingClientRect();
          let compare = Math.abs(contentRect.width - contentRect.height);
          // 如果差距不大，就不需要修正
          if (compare > 1) {
            // console.log("如果差距大，就需要修正");
            // 初始化百分比宽度、高度
            box.children[0].style.width = this.boxInitSize.width;
            box.children[0].style.height = this.boxInitSize.height;
            // 获取高宽（px单位）
            contentRect = box.children[0].getBoundingClientRect();

            // 宽度较长？ 那么减少宽度； 高度过高？ 那么减少高度，要按照百分比来进行设置
            if (contentRect.width > contentRect.height) {
              let widthGradient = this.gradientSplit(
                contentRect.width,
                contentRect.height
              );
              widthGradient.forEach((number, nid) => {
                setTimeout(() => {
                  box.children[0].style.width = number + "px";
                }, nid * 5);
              });
            } else if (contentRect.width < contentRect.height) {
              let heightGradient = this.gradientSplit(
                contentRect.width,
                contentRect.height
              );
              heightGradient.forEach((number, nid) => {
                setTimeout(() => {
                  box.children[0].style.height = number + "px";
                }, nid * 10);
              });
            }
          }
          this.desks[cid].boxes[bid].DOMRect = contentRect;
          this.desks[cid].boxes[bid].outerDOMRect = outerRect;
        });
      });
    },
    // rect1(在下)是 最后flex全局剩余没有strech的部分， rect2(在上 靠右)是flex布局BOX没有填满的部分（小于N*M - N）
    calcRestSpace(cont, boxes) {
      // debugger
      let rect1, rect2;
      if (boxes[boxes.length - 1] == undefined) {
        return {
          rect1: {},
          rect2: {}
        };
      }
      let lastBoxRect = boxes[boxes.length - 1].getBoundingClientRect();
      let contRect = cont.getBoundingClientRect();

      let N = this.layout.col;
      let M = this.layout.row;

      // 全部的Box，没有被每一行(N)整分，同时也满足没有满员的情况
      if (boxes.length % N != 0) {
        // 底部顶部右部都是重合了的，只有左部需要追加含有内容的盒子的宽度
        rect1 = {
          top: lastBoxRect.top,
          bottom: lastBoxRect.bottom,
          left: lastBoxRect.left + lastBoxRect.width,
          right: contRect.right
        };
      } else {
        rect1 = undefined;
      }

      if (Math.ceil(boxes.length / N) < M) {
        rect2 = {
          // lastBox的bottom就是他离上边的距离
          top: lastBoxRect.bottom,
          // 这个布局必然底部 左部 右部 重合
          bottom: contRect.bottom,
          left: contRect.left,
          right: contRect.right
        };
      } else if (Math.ceil(boxes.length / N) == M) {
        // 只剩最后一行的空间 只剩下rect2
        rect2 = undefined;
      }
      return {
        rect1,
        rect2
      };
    },
    swapArray(arr, i1, i2) {
      // 从下标arr[i2]自身开始向后删除，填充(...item)也就是arr[i1]，以数组形式返回被删掉的元素
      arr[i1] = arr.splice(i2, 1, arr[i1])[0];
      return arr;
    },
    gradientSplit(a, b) {
      let min = Math.min(a, b);
      let max = Math.max(a, b);
      let arr = [];
      arr.push(max);
      let start = Math.ceil(min);
      let end = Math.floor(max);
      for (let i = end; i > start; i--) {
        arr.push(i);
      }
      arr.push(min);
      // console.log(arr)
      return arr;
    },
    showEvent($event) {
      console.log(
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
      );
    }
  }
};
