import {v4 as uuidv4} from "uuid";
import Day from "@/components/ndg/topbar/time/def/Day";

export default class Week {
  constructor(order, daysArr, id) {
    this.days = daysArr || this.initWeekDays()
    this.id = id || uuidv4()
    this.order = order
  }

  setOrder(order) {
    this.order = order;
    return this
  }

  // 初始化
  initWeekDays() {
    return Array.apply(null, {length: 7}).map((d, di) => {
      // 默认今天
      return new Day().pass(di - new Date().getDay())
    })
    return this
  }

  // 向前移动n周
  formerWeek(n) {
    n = n || -1
    for (let i = 0; i < this.days.length; i++) {
      this.days[i].pass(-7 * Math.abs(n))
    }
    return this
  }

  // 向后移动n周
  laterWeek(n) {
    n = n || 1
    for (let i = 0; i < this.days.length; i++) {
      this.days[i].pass(7 * n)
    }
    return this
  }
}
