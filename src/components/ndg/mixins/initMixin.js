import { desks } from "../app.js";
import { BACKGROUND, CONTAINER, GROUPAPPLIMIT } from "../common.js";

export default {
  // 初始化 二维数组
  beforeCreate() {},
  data() {
    return {
      desks,
      currentDeskNum: 0,
      groupAppLimit: GROUPAPPLIMIT
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
  watch: {
  },
  methods: {
    locateCoordinate() {
      // debugger;
      //  多个桌面
      // DOMRect = box.getBoundingClientRect();
      document.querySelectorAll("." + CONTAINER).forEach((container, cid) => {
        let boxes = container.children;
        Array.from(boxes).forEach((box, bid) => {
          // console.log(box.getBoundingClientRect());
          this.$set(
            this.desks[cid].boxes[bid],
            "DOMRect",
            box.getBoundingClientRect()
          );
          // this.desks[cid].boxes[bid].DOMRect = {
          //   top: 0,
          //   bottom: 0,
          //   left: 0,
          //   right: 0,
          //   width: 0,
          //   height: 0,
          //   x: 0,
          //   y: 0
          // };
        });
      });
    },
    switchUnit(orientation) {
      // 切换桌面
      let transform = () => {
        document.querySelector(
          "div." + BACKGROUND
        ).style.transform = `translateX(-${this.deskShiftOffset *
          this.currentDeskNum}%)`;
      };
      switch (orientation) {
        case "right":
          if (this.currentDeskNum + 1 < this.desks.length) {
            this.currentDeskNum++;
            transform();
          }
          break;
        case "left":
          transform();
          if (this.currentDeskNum > 0) {
            this.currentDeskNum--;
            transform();
          }
          break;
        default:
          console.log("wtf");
      }
    }
  }
};
