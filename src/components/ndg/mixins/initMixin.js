import { desks } from "../app.js";
import { BACKGROUND, CONTAINER, GROUPAPPLIMIT } from "../common.js";

export default {
  // 初始化 二维数组
  beforeCreate() {},
  data() {
    return {
      desks,
      currentDeskNo: 0,
      groupAppLimit: GROUPAPPLIMIT,
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
      document.querySelectorAll("." + CONTAINER).forEach((container, cid) => {
        let boxes = container.children;
        Array.from(boxes).forEach((box, bid) => {
          // console.log(box.getBoundingClientRect());
          this.$set(
            this.desks[cid].boxes[bid],
            "DOMRect",
            box.getBoundingClientRect()
          );
          // 是否被 dragover
          this.$set(this.desks[cid].boxes[bid], "dragOverFlag", false);
          // 悬停时长，判断当前BOX是否要被合并；至于是否换位（挤压），还要判断鼠标指针 和 BOX几何中心的距离
          this.$set(this.desks[cid].boxes[bid], "suspendTime", 0);
          // 做出translate动作以后，dragover要重置为false，suspendTime要归零
          this.$set(
            this.desks[cid].boxes[bid],
            "translate",
            "translate(0%,0%)"
          );
        });
      });
    },
    // 更新所有BOX的位置信息
    relocateDOM() {
      document.querySelectorAll("." + CONTAINER).forEach((container, cid) => {
        Array.from(container.children).forEach((box, bid) => {
          this.desks[cid].boxes[bid].DOMRect = box.getBoundingClientRect();
        });
      });
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
    swap(a, b) {
      let swap = {};
      swap = a;
      a = b;
      b = swap;
    }
  }
};
