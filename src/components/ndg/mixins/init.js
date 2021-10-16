import {desks} from "../app.js"
import {BACKGROUND, CONTAINER, GROUPAPPLIMIT} from "../common.js"
import {Timer} from "@/components/ndg/timer"

export default {
  // 初始化 二维数组
  beforeCreate() {
  },
  updated() {
    this.throttle(() => {
      // console.info("%c NDG-Updated()--渲染完毕", "background-color: orange border-radius: 2px padding-right: 1px")
      this.locateBOX()
    }, 500, this.updatedTimer)()
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
    }
  },
  model: {
    value: "desks",
    event: "changeDesk"
  },
  computed: {
    // 计算桌面总宽度
    deskWidth() {
      return this.desks.length * 100 + "%"
    },
    deskShiftOffset() {
      return 100 / this.desks.length
    },
    deskOffset() {
      let totalOffset = 100 / this.desks.length * this.currentDeskNo
      return `translateX(-${totalOffset}%)`
    },
    rectArr1() {
      let arr = []
      // 列 5
      let col = this.layout.col
      // 行 4
      let row = this.layout.row

      this.desks.forEach((desk, did) => {
        let boxNum = desk.boxes.length
        // 如果刚好填满多个行
        if (boxNum % col == 0) {
          arr.push('0%')
        } else {
          let width = (col - boxNum % col) / col * 100 + '%'
          arr.push(width)
        }
      })
      return arr
    },
    rectArr2() {
      let arr = []
      // 列 5
      let col = this.layout.col
      // 行 4
      let row = this.layout.row
      this.desks.forEach((desk, did) => {
        let boxNum = desk.boxes.length
        // let height = (row - Math.ceil(boxNum / col)) / row * 100 + '%'
        let height = (row - Math.ceil(boxNum / col)) / row  * 75 + 'vh'
        arr.push(height)
      })
      return arr
    }
  },
  watch: {
    "currentDeskNo": {
      handler: function (val, oldVal) {
        this.deskSwitching = true
        // console.info(this.deskSwitching, "正在切换桌面！！！")
        setTimeout(() => {
          // 重新定位BOX
          this.locateBOX()
          // 切换桌面完毕
          this.deskSwitching = false
          // console.info("切换桌面完毕！！！")
        }, this.switchDeskTimeCost)
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
    initBOX() {
      // 初始化BOX的定位和尺寸
      let containers = document.querySelectorAll("." + CONTAINER)
      containers.forEach((cont, cid) => {
        let boxes = cont.children
        Array.from(boxes).forEach((box, bid) => {
          if (bid < boxes.length - 2) {
            let contentRect = box.children[0].getBoundingClientRect()
            // 外部 ndg-outer
            let outerRect = box.getBoundingClientRect()
            this.$set(this.desks[cid].boxes[bid], "DOMRect", contentRect)
            this.$set(this.desks[cid].boxes[bid], "outerDOMRect", outerRect)
            // 该盒子显示的组号： 默认为0也就是第一组
            this.$set(this.desks[cid].boxes[bid], "displayNum", 0)
            // 是否以模态框的形式打开模态框
            this.$set(this.desks[cid].boxes[bid], "showModal", false)
            // 该BOX是否被拖拽物覆盖
            this.$set(this.desks[cid].boxes[bid], "covered", false)
            // 在ndg-content-border之内的悬停时长计时器
            this.$set(this.desks[cid].boxes[bid], "innerSuspendTimer", new Timer())
            // 在ndg-outer和ndg-content-border之间的悬停时间计时器
            this.$set(this.desks[cid].boxes[bid], "outerSuspendTimer", new Timer())
          }
        })
      })
    },
    // 疑难点：DOM刷新总是 滞后于 数据更新，所以要根据数据来（计算，定义，更新）DOM的新属性。（初始化的情况除外）
    locateBOX() {
      let containers = document.querySelectorAll("." + CONTAINER)
      containers.forEach((cont, cid) => {
        let boxes = cont.children
        Array.from(boxes).forEach((box, bid) => {
          try {
            if (bid < boxes.length - 2) {
              let contentRect = box.children[0].getBoundingClientRect()
              // 外部 ndg-outer
              let outerRect = box.getBoundingClientRect()
              this.desks[cid].boxes[bid].DOMRect = contentRect
              this.desks[cid].boxes[bid].outerDOMRect = outerRect
            }
          } catch (exp) {
            console.info(cid, bid,)
            console.info(`%c${exp}%c`, "background:#41b883  padding: 1px border-radius: 0 3px 3px 0  color: #fff", "background:transparent")
          }
        })
      })
    },
    // 重置BOX 高宽尺寸 以及所有的悬停状态
    resetBOX(onlyResetTime) {
      for (let did = 0 ;did < this.desks.length; did++) {
        let boxes = this.desks[did]
        for (let bid = 0; did < boxes.length ;bid++) {
          let boxDOM = document.querySelectorAll("." + CONTAINER)[did].children[bid]
          // 内部 ndg-outer-border
          let contentRect = boxDOM.children[0].getBoundingClientRect()
          // 外部 ndg-outer
          let outerRect = boxDOM.getBoundingClientRect()
          boxDOM.children[0].style.transform = ""
          let box = this.desks[did].boxes[bid]
          box.DOMRect = contentRect
          box.outerDOMRect = outerRect
          if (onlyResetTime == true || onlyResetTime == undefined) {
            box.covered = false
            box.outerSuspendTimer = new Timer()
            box.innerSuspendTimer = new Timer()
          }
        }
      }
    },
    recoverOtherBox(deskIndex, boxIndex) {
      this.desks[deskIndex].boxes.forEach((item, index) => {
        if (index != boxIndex) {
          item.covered = false
          item.innerSuspendTimer = 0
          item.outerSuspendTimer = 0
        }
      })
    },
    // 计算某个桌面的某个盒子内部的app数量
    appCounter(deskIndex, boxIndex) {
      return this.desks[deskIndex].boxes[boxIndex].appGroups.flat(2).filter(app => {
        return app.name != ''
      }).length
    },
    // 节流修饰
    throttle(fn, delay, timer) {
      return function () {
        var context = this
        var args = arguments
        if (!timer) {
          timer = setTimeout(function () {
            fn.apply(context, args)
            timer = null
          }, delay)
        }
      }
    },
    // 防抖修饰
    debounce(fn, delay) {
      let timer = null
      return function (...args) {
        window.clearTimeout(timer)
        timer = setTimeout(() => {
          fn.apply(this, args)
        }, delay)
      }
    }
  }
}
