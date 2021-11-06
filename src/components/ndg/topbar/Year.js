export default class Year {
  constructor(year) {
    this.year = year;
    // 是否是闰年
    this.leap = year % 4 == 0
  }
}
