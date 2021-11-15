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
    this.$watch = {
      month: (val, oldVal) => {
        if (val != oldVal)
          this.monthName = monthName[val - 1]
      },
    }
    // 让this.month变成响应式的数据
    this.defineReactive('month')
  }

  formerMonth(n) {

  }

  latterMonth(n) {

  }
}
