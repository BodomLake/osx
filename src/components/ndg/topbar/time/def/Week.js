import {v4 as uuidv4} from "uuid";
import Day from "@/components/ndg/topbar/time/def/Day";

export default class Week {
  constructor(daysArr, id, order) {
    this.days = daysArr || this.initWeekDays()
    this.id = id || uuidv4()
    this.order = order
  }

  formerWeek(n) {
    n = n || -1
    for (let i = 0; i < this.days.length; i++) {
      this.days[i].pass(-7 * Math.abs(n))
    }
  }

  latterWeek(n) {
    n = n || 1
    for (let i = 0; i < this.days.length; i++) {
      this.days[i].pass(7 * n)
    }
  }

  // 初始化
  initWeekDays() {
    return Array.apply(null, {length: 7}).map((d, di) => {
      // 默认今天
      return new Day().pass(di - new Date().getDay())
    })
  }
}
