import Reactive from "@/components/ndg/common/Reactive";

const monthName = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const weekDayName = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const monthDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
export default class Day extends Reactive {
  constructor(year, month, date, day) {
    super()
    // 几几年
    this.year = year || new Date().getFullYear();
    // 几月
    this.month = month || new Date().getMonth() + 1;
    // 几号
    this.date = date || new Date().getDate()
    // 周几
    this.day = day || new Date().getDay()
    // 该日所属周是该年的第几个周？
    this.weekNo = this.calcWeekNo(this.year, this.month, this.date);
    // 星期的名字
    this.dayName = weekDayName[this.day]
    // 响应的月份名字
    this.monthName = monthName[this.month - 1]

    // 响应的leap true为闰年
    this.leap = this.year % 4 == 0

    this.$watch = {
      month: (val, oldVal) => {
        console.log(val, oldVal)
        if (val != oldVal)
          this.monthName = monthName[val - 1]
      },
      date: (newDate, date) => {
        // date的变化导致 (month year date day weekNo) 的变化
        let oldDay = new Date(`${this.month} ${date}, ${this.year}`)
        let newDay = new Date(oldDay.getTime() + (newDate - date) * 3600 * 1000 * 24)
        this.year = newDay.getFullYear()
        this.month = newDay.getMonth() + 1
        this.day = newDay.getDay()
        this.dayName = weekDayName[newDay.getDay()]
        this.weekNo = this.calcWeekNo(newDay.getFullYear(), newDay.getMonth() + 1, newDay.getDate());
        return newDay.getDate()
      },
      year: (val, oldVal) => {
        this.leap = this.year % 4 == 0
      }
    }
    // 双向绑定的数据代理者，取值从这里实现
    this.$data = {
      month: this.month,
      date: this.date,
      year: this.year
    }

    // 让this.month变成响应式的数据
    this.defineReactive('month')
    this.defineReactive('date')
  }

  // 默认过一天
  pass(number) {
    this.date += number || 0
    return this
  }

  // 根据年月日，返回他是这一年的第几周，数字上的，不是数组下标
  calcWeekNo(year, month, date) {
    // console.log(year, month, date)
    // 第一个星期四 算作 每一年第一个星期的标志
    let startDay = new Date(`1 1, ${year}`)
    let startThursday;
    // 1月1号在第一个星期四之前，可能是 星期三 星期二 星期一 星期天
    if (startDay.getDay() <= 3) {
      startThursday = new Date(`1 ${4 - startDay.getDay()}, ${year}`)
    } else if (startDay.getDay() > 3) {
      startThursday = new Date(`1 ${11 - startDay.getDay()}, ${year}`)
      // 如果这一年的第一天是 星期五 或者 星期六 就算1号 (+ 2号)是 第零周
      return 0;
    }
    let day = new Date(`${month} ${date}, ${year}`)
    let dayCounts = (day.getTime() - startThursday.getTime()) / 1000 / 3600 / 24 + 4
    // console.log(dayCounts)
    // TODO 逻辑有问题
    return dayCounts > 0 ? Math.ceil(dayCounts / 7) : 1;
  }
}
