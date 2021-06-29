import { desks } from "../app.js";
import { BACKGROUND, CONTAINER, GROUPAPPLIMIT } from "../common.js";

export default {
  // 初始化 二维数组
  beforeCreate() {},
  data() {
    return {
      desks,
      // 当前指向的桌面序号
      currentDeskNo: 0,
      // 每个BOX每页限制显示数量的上限
      groupAppLimit: GROUPAPPLIMIT,
      // 切换桌面所需要的时间（transition动画时间）
      switchDeskTime: 0.5,
      // 方格尺寸
      gridSize: {
        "--gw": 100 / this.grid.col + "%",
        "--gh": 100 / this.grid.row + "%"
      }
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
          // console.log(box.children[0].getBoundingClientRect());
          this.$set(
            this.desks[cid].boxes[bid],
            "DOMRect",
            box.children[0].getBoundingClientRect()
          );
          // 是否被 dragover
          this.$set(this.desks[cid].boxes[bid], "covered", false);
          // 悬停时长，判断当前BOX是否要被合并；至于是否换位（挤压），还要判断鼠标指针 和 BOX几何中心的距离
          this.$set(this.desks[cid].boxes[bid], "suspendTime", 0);
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
        Array.from(boxes).forEach((b, bid) => {
          this.desks[cid].boxes[
            bid
          ].DOMRect = b.children[0].getBoundingClientRect();
        });
        // 追加剩余空间的属性
        this.$set(
          this.desks[cid],
          "restSpace",
          this.calcRestSpace(cont, boxes)
        );
      });
    },
    // rect2 在下 rect1在上 靠右
    // rect1是 最后flex全局剩余没有strech的部分， rect2是flex布局BOX没有填满的部分（小于N*M - N）
    calcRestSpace(cont, boxes) {
      // debugger
      let lastBoxRect = boxes[boxes.length - 1].getBoundingClientRect();
      // console.log(boxes[boxes.length - 1], lastBoxRect);
      // 如果是 列数的整数倍
      let contRect = cont.getBoundingClientRect();
      let rect1, rect2;
      let N = this.grid.col;
      let M = this.grid.row;
      //
      if (boxes.length % N == 0 && Math.ceil(boxes.length / N) < M) {
        rect2 = {
          // lastBox的bottom就是他离上边的距离
          top: lastBoxRect.bottom,
          // 这个布局必然底部 左部 右部 重合
          bottom: contRect.bottom,
          left: contRect.left,
          right: contRect.right
        };
      } else if (Math.ceil(boxes.length / N) == M) {
        // 只剩最后一行的空间 只剩下rest2
        rect2 = undefined;
      }
      // 全部的Box，没有被每一行(N)整分，同时也满足没有满员的情况
      if (boxes.length % N != 0) {
        // 底部顶部右部都是重合了的，只有左部需要追加含有内容的盒子的宽度
        rect1 = {
          top: lastBoxRect.top,
          bottom: lastBoxRect.bottom,
          left: lastBoxRect.left + lastBoxRect.width,
          right: contRect.right
        };
      }
      return { rect1, rect2 };
    },
    switchUnit(orientation) {
      // 切换桌面
      let transform = () => {
        document.querySelector(
          "div." + BACKGROUND
        ).style.transform = `translateX(-${this.deskShiftOffset *
          this.currentDeskNo}%)`;
        // 切换桌面要500ms的时间，所以延时执行relcoateDOM
        setTimeout(() => {
          this.relocateDOM();
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
          transform();
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
        $event.pageY
      );
    }
  }
};
