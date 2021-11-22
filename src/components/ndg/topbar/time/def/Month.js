import Reactive from "@/components/ndg/common/Reactive";

const monthName = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
export default class Month extends Reactive {
  constructor(year, month) {
    super();
    // 几几年
    this.year = year || new Date().getFullYear();
    // 几月
    this.month = month || new Date().getMonth() + 1;
    // 该月份的名字
    this.monthName = monthName[this.month - 1]

    // 双向绑定的数据代理者，取值从这里实现
    this.$data = {
      month: this.month,
    }
    //（-35 一月 -24 十二月）  （-23 一月 -12 十二月） （-11 一月 0 十二月 ）
    //（1 一月 12 十二月） （13 一月 24 十二月）（25 一月 36 十二月）
    this.$watch = {
      month: (val, oldVal) => {
        if (val > 0) {
          // 每12个月，递进一次年份
          this.year += Math.floor((val - 1) / 12)
          // 12进制
          val = val % 12 == 0 ? 12 : val % 12
          this.monthName = monthName[val - 1]
          return val
        } else {
          // 每12个月，递退一次年份
          this.year += Math.floor((val - 1) / 12)
          // 十二进制
          val = val % 12 == 0 ? 12 : 12 + val % 12
          this.monthName = monthName[val - 1]
          return val
        }
      },
    }
    // 让this.month变成响应式的数据
    this.defineReactive('month')
  }

  formerMonth(n) {
    this.month -= n || 0;
  }

  laterMonth(n) {
    this.month += n || 0;
  }


  formerYear(n) {
    this.year -= n || 0;
  }

  laterYear(n) {
    this.year += n || 0;
  }
}
