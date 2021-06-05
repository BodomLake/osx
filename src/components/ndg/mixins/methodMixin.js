import {
  BACKGROUND,
  CONTAINER,
  GROUPAPPLIMIT
} from "../common.js";

export default {
  // 初始化 二维数组
  beforeCreate() {
  },
  data() {
    return {
      currentAppGroup: 0,
      groupAppLimit: GROUPAPPLIMIT
    };
  },
  computed: {
    // 计算桌面总宽度
    deskWidth() {
      return deskNum * 100 + "%";
    },
    deskShiftOffset() {
      return 100 / deskNum;
    },
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
    calcBoxWidth(arr) {
      if (arr && arr.length > 0) {
        return 100 * arr.length + "%";
      } else {
        return "100%";
      }
    },
    calcBoxOffsetX(arr, displayNo) {
      let len = arr.length;
      // debugger
      return `translateX(-${displayNo*(100/len)}%)`;
    },
    splitArr(arr) {
      //arr是你要分割的数组，num是以几个为一组
      let newArr = []; //首先创建一个新的空数组。用来存放分割好的数组
      for (let i = 0; i < arr.length;) {
        //注意：这里与for循环不太一样的是，没有i++
        newArr.push(arr.slice(i, (i += this.groupAppLimit)));
      }
      return newArr;
    },
    switchDesktop(orientation) {
      // 切换桌面
      let transform = () => {
        document.querySelector(
          "div." 
        ).style.transform = `translateX(-${this.deskShiftOffset * this.currentDeskNum}%)`;
      };
      switch (orientation) {
        case "right":
          if (this.currentAppGroup + 1 < this.desks.length) {
            this.currentAppGroup++;
            transform();
          }
          break;
        case "left":
          transform();
          if (this.currentAppGroup > 0) {
            this.currentAppGroup--;
            transform();
          }
          break;
        default:
          console.log("wtf");
      }
    }
  }
};
