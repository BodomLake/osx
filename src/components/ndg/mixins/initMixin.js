import {desks} from "../app.js";
import {BACKGROUND, CONTAINER, DESKTOP, GROUPAPPLIMIT} from "../common.js";
import {v4 as uuidv4} from "uuid";

export default {
  // 初始化 二维数组
  beforeCreate() {
  },
  updated() {
    this.throttle(() => {
      console.log("%c NDG-Updated()--渲染完毕", "background-color: orange; border-radius: 2px; padding-right: 1px");
      this.locateBOX();
    }, 500, this.updatedTimer)();
  },
  data() {
    return {
      desks,
      // 当前指向的桌面序号
      currentDeskNo: 0,
      // 每个BOX每页限制显示数量的上限
      groupAppLimit: GROUPAPPLIMIT,
      // 切换桌面所需要的时间（transition动画时间）
      switchDeskTimeCost: 500,
      updatedTimer: null,
    };
  },
  model: {
    value: "desks",
    event: "changeDesk"
  },
  computed: {
    // 计算桌面总宽度
    deskWidth() {
      return this.desks.length * 100 + "%";
    },
    deskShiftOffset() {
      return 100 / this.desks.length;
    },
    deskOffset() {
      let totalOffset = 100 / this.desks.length * this.currentDeskNo;
      return `translateX(-${totalOffset}%)`;
    }
  },
  watch: {
    "currentDeskNo": {
      handler: function (val, oldVal) {
        this.deskSwitching = true;
        // console.log(this.deskSwitching, "正在切换桌面！！！");
        setTimeout(() => {
          // 重新定位BOX
          this.locateBOX();
          // 切换桌面完毕
          this.deskSwitching = false;
          // console.log("切换桌面完毕！！！");
        }, this.switchDeskTimeCost);
      },
      immediate: false
    },
    // 每个桌面的百分比长度，随着desks.length的变化而变化
    "deskShiftOffset": {
      handler: function (val, oldVal) {
        if (val != oldVal) {
          // 桌面个数的变化会因为transition的存在而导致晃动，所以要屏蔽该css属性一段时间
          document.querySelector("div." + BACKGROUND).style.transition = ''
        }
        setTimeout(() => {
          // 恢复该属性
          document.querySelector("div." + BACKGROUND).style.transition = `all ${this.switchDeskTimeCost}ms ease-in-out`
        }, 50)
      },
      immediate: false
    },
  },
  methods: {
    // 调整某个桌面多余的BOX
    adjustDesk(deskIndex, overNum) {
      this.desks[deskIndex].boxes = this.desks[deskIndex].boxes.filter((box, bid) => {
        let appCount = this.appCounter(deskIndex, bid);
        // 代表该占位盒子被删除
        if (appCount > 0) {
          overNum--;
        }
        // 如果删除完毕就不要再过滤了
        if (overNum > 0) {
          if (appCount == 0) {
            return false;
          }
        } else {
          return true;
        }

      })
    },
    // 构建一个空白占位的BOX
    buildBlankBox() {
      let apps = [];
      for (let a = 0; a < this.groupAppLimit; a++) {
        let app = {name: "", id: uuidv4()};
        apps.push(app);
      }
      let appendBox = {
        id: uuidv4(),
        name: "",
        groupAppLimit: this.groupAppLimit,
        appGroups: [apps],
        innerSuspendTime: 0,
        outerSuspendTime: 0,
        covered: false,
      };
      return appendBox;
    },
    // 填充盒子
    fillBlank() {
      const boxMaxLimit = this.layout.col * this.layout.row;
      // 填充每一个桌面的每一个盒子，并且每一个盒子的app组全部填满
      this.desks.forEach((desk, did) => {

        // 先填满现存每一个box的appGroups 占位格
        desk.boxes.forEach((box, bid) => {
          box.appGroups.forEach((group, gid) => {
            // 填满每一组
            for (let i = group.length; i < this.groupAppLimit; i++) {
              let app = {name: "", id: uuidv4()};
              group.push(app);
            }
          });
        });

        // 如果该桌面盒子不够，就追加盒子
        const len = desk.boxes.length;
        if (len < boxMaxLimit) {
          for (let i = len; i < boxMaxLimit; i++) {
            // 盒子里填充的App空位
            let appendBox = this.buildBlankBox();
            desk.boxes.push(appendBox);
          }
        }
      });
    },
    initBOX() {
      this.fillBlank();
      // 初始化BOX的定位和尺寸
      let containers = document.querySelectorAll("." + CONTAINER);
      containers.forEach((cont, cid) => {
        let boxes = cont.children;
        Array.from(boxes).forEach((box, bid) => {
          let contentRect = box.children[0].getBoundingClientRect();
          // 外部 ndg-outer
          let outerRect = box.getBoundingClientRect();
          this.$set(this.desks[cid].boxes[bid], "DOMRect", contentRect);
          this.$set(this.desks[cid].boxes[bid], "outerDOMRect", outerRect);
          // 该盒子显示的组号： 默认为0也就是第一组
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
      });
    },
    // 仅仅是定位BOX
    // 疑难点：DOM刷新总是 滞后于 数据更新，所以要根据数据来（计算，定义，更新）DOM的新属性。（初始化的情况除外）
    locateBOX() {
      let containers = document.querySelectorAll("." + CONTAINER);
      containers.forEach((cont, cid) => {
        let boxes = cont.children;
        Array.from(boxes).forEach((box, bid) => {
          try {
            let contentRect = box.children[0].getBoundingClientRect();
            // 外部 ndg-outer
            let outerRect = box.getBoundingClientRect();
            this.desks[cid].boxes[bid].DOMRect = contentRect;
            this.desks[cid].boxes[bid].outerDOMRect = outerRect;
          } catch (exp) {
            console.log(cid, bid,);
            console.log(`%c${exp}%c`, "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff", "background:transparent");
          }
        })
      })
    },
    // 重置BOX 高宽尺寸 以及所有的悬停状态
    resetBOX(onlyResetTime) {
      for (let did = 0; did < this.desks.length; did++) {
        let boxes = this.desks[did];
        for (let bid = 0; did < boxes.length; bid++) {
          let boxDOM = document.querySelectorAll("." + CONTAINER)[did].children[bid];
          // 内部 ndg-outer-border
          let contentRect = boxDOM.children[0].getBoundingClientRect();
          // 外部 ndg-outer
          let outerRect = boxDOM.getBoundingClientRect();
          boxDOM.children[0].style.transform = "";
          let box = this.desks[did].boxes[bid];
          box.DOMRect = contentRect;
          box.outerDOMRect = outerRect;
          if (onlyResetTime == true || onlyResetTime == undefined) {
            box.covered = false;
            box.outerSuspendTime = 0;
            box.innerSuspendTime = 0;
          }
        }
      }
    },
    recoverOtherBox(deskIndex, boxIndex) {
      this.desks[deskIndex].boxes.forEach((item, index) => {
        if (index != boxIndex) {
          item.covered = false;
          item.innerSuspendTime = 0;
          item.outerSuspendTime = 0;
        }
      });
    },
    // 交换数组的元素,并且返回被splice()修改的数组
    swapEle(arr, i1, i2) {
      // 从下标arr[i2]自身开始向后删除，填充(...item)也就是arr[i1]，以数组形式返回被删掉的元素
      arr[i1] = arr.splice(i2, 1, arr[i1])[0];
      return arr;
    },
    gradientSplit(a, b, step) {
      let min = Math.min(a, b);
      let max = Math.max(a, b);
      let arr = [];
      arr.push(max);
      let start = Math.ceil(min);
      let end = Math.floor(max);
      if (!step) {
        step = 2;
      }
      for (let i = end; i > start; i = i - step) {
        arr.push(i);
      }
      arr.push(min);
      // console.log(arr)
      return arr;
    },
    // 计算某个桌面的某个盒子内部的app数量
    appCounter(deskIndex, boxIndex) {
      return this.desks[deskIndex].boxes[boxIndex].appGroups.flat(2).filter(app => {
        return app.name != ''
      }).length;
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
    },
    inRegion(val, a, b) {
      let low = Math.min(a, b)
      let high = Math.max(a, b)
      return val > low && val < high;
    },
    // 节流修饰
    throttle(fn, delay, timer) {
      return function () {
        var context = this;
        var args = arguments;
        if (!timer) {
          timer = setTimeout(function () {
            fn.apply(context, args);
            timer = null;
          }, delay);
        }
      }
    },
    // 防抖修饰
    debounce(fn, delay) {
      let timer = null;
      return function (...args) {
        window.clearTimeout(timer)
        timer = setTimeout(() => {
          fn.apply(this, args);
        }, delay)
      }
    }
  }
};
