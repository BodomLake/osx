import { desks } from "../app.js";

import { BACKGROUND, CONTAINER, GROUPAPPLIMIT } from "../common.js";

import { stringify, v4 as uuidv4 } from "uuid";

export default {
  // 初始化 二维数组
  beforeCreate() {
  },
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
  watch: {},
  methods: {
    locateCoordinate() {
      Array.from(document.querySelector("." + CONTAINER).children).forEach(
        (outer, oi) => {
          if (outer.className.indexOf("ndg-outer") != -1) {
            this.box[oi].DOMRect = outer.getBoundingClientRect();
          }
          // console.log(outer.children);
          Array.from(outer.children).forEach((inner, ii) => {
            if (inner.className.indexOf("ndg-inner") != -1) {
              this.box[oi].innerBox[ii].DOMRect = inner.getBoundingClientRect();
              // console.log(inner.getBoundingClientRect());
            }
          });
        }
      );
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
