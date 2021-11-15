import Reactive from "@/components/ndg/common/Reactive";
import Month from "@/components/ndg/topbar/time/def/Month";
import {v4 as uuidv4} from "uuid";

export default class Year extends Reactive {
  constructor(year, monthsArr,id) {
    super()
    this.year = year || new Date().getFullYear();
    this.months = monthsArr || this.initYearMonths(this.year);
    this.id = id || uuidv4()
    // 是否是闰年
    this.leap = year % 4 == 0;

    this.$data = {
      year: this.year,
    }
    this.$watch = {
      year: (val, oldVal) => {
        this.leap = year % 4 == 0;
      }
    }
    this.defineReactive('year')
  }

  // 默认初始化这一年的所有月份
  initYearMonths(year) {
    let months = new Array(12)
    for (let m = 0; m < 12; m++) {
      months[m] = new Month(year, m + 1)
    }
    return months;
  }

  // 向前推n年
  formerYear(n) {
    this.year += Math.abs(n) || 0
    this.months = this.initYearMonths(this.year)
    return this
  }

  // 向后推n年
  latterYear(n) {
    this.year -= Math.abs(n) || 0
    this.months = this.initYearMonths(this.year)
    return this
  }
}
