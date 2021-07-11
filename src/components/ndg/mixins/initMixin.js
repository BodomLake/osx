import { desks } from "../app.js";
import { BACKGROUND, CONTAINER } from "../common.js";

export default {
  // 初始化 二维数组
  beforeCreate() {},
  data() {
    return {
      desks,
      // 当前指向的桌面序号
      currentDeskNo: 0,
      // 每个BOX每页限制显示数量的上限
      // groupAppLimit: GROUPAPPLIMIT,
      // 切换桌面所需要的时间（transition动画时间）
      switchDeskTime: 0.5
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
  methods: {
    locateCoordinate() {
      document.querySelectorAll("." + CONTAINER).forEach((cont, cid) => {
        let boxes = cont.children;
        Array.from(boxes).forEach((box, bid) => {
          // 内部 ndg-content-border
          let contentRect = box.children[0].getBoundingClientRect();
          // 外部 ndg-outer
          let outerRect = box.getBoundingClientRect();
          // 取最小的一条边长
          // let minLen = Math.min(contentRect.width, contentRect.height);
          // console.log(contentRect, "最小的边长", minLen);
          // 宽度较长？ 那么减少宽度； 高度过高？ 那么减少高度，要按照百分比来进行设置
          if (contentRect.width > contentRect.height) {
            box.children[0].style.width = contentRect.height + "px";
          } else if (contentRect.width < contentRect.height) {
            box.children[0].style.height = contentRect.width + "px";
          }
          // 再次获取定位信息
          contentRect = box.children[0].getBoundingClientRect();
          this.$set(this.desks[cid].boxes[bid], "DOMRect", contentRect);
          this.$set(this.desks[cid].boxes[bid], "outerDOMRect", outerRect);
          this.$set(this.desks[cid].boxes[bid], "covered", false);
          // 在ndg-content-border之内的悬停时长
          this.$set(this.desks[cid].boxes[bid], "innerSuspendTime", 0);
          // 在ndg-outer和ndg-content-border之间的悬停时间
          this.$set(this.desks[cid].boxes[bid], "outerSuspendTime", 0);
        });
        // 追加剩余空间的属性
        this.$set(
          this.desks[cid],
          "restSpace",
          this.calcRestSpace(cont, boxes)
        );
      });
    },
    // 更新所有BOX的位置信息
    relocateDOM() {
      document.querySelectorAll("." + CONTAINER).forEach((cont, cid) => {
        let boxes = cont.children;
        Array.from(boxes).forEach((box, bid) => {
          // 先复位填满 div.ndg-outer
          box.children[0].style.width = this.boxInitSize.width;
          box.children[0].style.height = this.boxInitSize.height;
          // 内部 ndg-content-border
          let contentRect = box.children[0].getBoundingClientRect();
          // 外部 ndg-outer
          let outerRect = box.getBoundingClientRect();
          // 取最小的一条边长
          // let minLen = Math.min(contentRect.width, contentRect.height);
          // console.log(contentRect, "最小的边长", minLen);
          if (contentRect.width > contentRect.height) {
            box.children[0].style.width = contentRect.height + "px";
          } else if (contentRect.width < contentRect.height) {
            box.children[0].style.height = contentRect.width + "px";
          }
          // 再次获取定位信息
          contentRect = box.children[0].getBoundingClientRect();
          this.desks[cid].boxes[bid].DOMRect = contentRect;
          this.desks[cid].boxes[bid].outerDOMRect = outerRect;
          this.desks[cid].boxes[bid].covered = false;
          this.desks[cid].boxes[bid].innerSuspendTime = 0;
          this.desks[cid].boxes[bid].outerSuspendTime = 0;
          box.children[0].style.transform = "";
        });
        this.desks[cid].restSpace = this.calcRestSpace(cont, boxes);
      });
    },
    // rect1(在下)是 最后flex全局剩余没有strech的部分， rect2(在上 靠右)是flex布局BOX没有填满的部分（小于N*M - N）
    calcRestSpace(cont, boxes) {
      // debugger
      let lastBoxRect = boxes[boxes.length - 1].getBoundingClientRect();
      let contRect = cont.getBoundingClientRect();
      let rect1, rect2;
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
    switchUnit(orientation) {
      this.deskSwitching = true;
      console.log(this.deskSwitching, "正在切换桌面！！！");
      // 切换桌面
      let transform = () => {
        document.querySelector(
          "div." + BACKGROUND
        ).style.transform = `translateX(-${this.deskShiftOffset *
          this.currentDeskNo}%)`;
        // 切换桌面要500ms的时间，所以延时执行relcoateDOM
        setTimeout(() => {
          this.relocateDOM();
          this.deskSwitching = false;
          console.log(this.deskSwitching, "切换桌面完毕！！！");
        }, this.switchDeskTime * 1000);
      };
      switch (orientation) {
        case "right":
          if (this.currentDeskNo + 1 < this.desks.length) {
            this.currentDeskNo++;
            transform();
          }
          break;
        case "left":
          if (this.currentDeskNo > 0) {
            this.currentDeskNo--;
            transform();
          }
          break;
        default:
          console.log("what the keycode that you pressed just now");
      }
    },
    clearTranslate() {
      document.querySelectorAll("." + CONTAINER).forEach((container, cid) => {
        let boxes = container.children;
        Array.from(boxes).forEach((box, bid) => {
          box.style.transform = "";
          box.style.transition = "";
        });
      });
    },
    swapArray(arr, i1, i2) {
      // 从下标arr[i2]自身开始向后删除，填充(...item)也就是arr[i1]，以数组形式返回被删掉的元素
      arr[i1] = arr.splice(i2, 1, arr[i1])[0];
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
