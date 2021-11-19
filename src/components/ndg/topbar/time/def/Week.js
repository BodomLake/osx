import {v4 as uuidv4} from "uuid";
import Day from "@/components/ndg/topbar/time/def/Day";

export default class Week {
  constructor(order, day, id) {
    this.order = order
    this.days = this.initWeekDays(day)
    this.id = id || uuidv4()
  }

  setOrder(order) {
    this.order = order;
    return this
  }

  // 根据某一天，初始化那一天所在的周
  initWeekDays(day) {
    return Array.apply(null, {length: 7}).map((ele, di) => {
      // 根据那一天来判断 如果没有就默认今天
      let d = day && day instanceof Day ? new Day(day.year, day.month, day.date, day.day) : new Day()
      return d.pass(di - d.day)
    })
  }

  // 向前移动n周
  formerWeek(n) {
    n = n || -1
    // 每一天都前移
    for (let i = 0; i < this.days.length; i++) {
      this.days[i].pass(-7 * Math.abs(n))
    }
    return this
  }

  // 向后移动n周
  laterWeek(n) {
    n = n || 1
    // 每一天都后移
    for (let i = 0; i < this.days.length; i++) {
      this.days[i].pass(7 * n)
    }
    return this
  }

  printWeek() {
    let desc = []
    for (let i = 0; i < this.days.length; i++) {
      desc.push(this.days[i].toString())
    }
    console.log(desc.join('=>'))
  }
}
