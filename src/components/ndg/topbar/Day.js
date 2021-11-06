const monthName = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
export default class Day {
  constructor(year, month, date, day) {
    // 几几年
    this.year = year;
    // 几月
    this.month = month;
    // 几号
    this.date = date
    // 周几
    this.day = day;
    this.monthName = monthName[month - 1]
  }
}
