import Reactive from "@/components/ndg/common/Reactive";
import Year from "@/components/ndg/topbar/time/def/Year";
import {v4 as uuidv4} from "uuid";
import {splitArrayByGroup} from "@/components/ndg/common/common";

export default class History extends Reactive {
  constructor(year) {
    super();
    // 决定年段的年份 默认今天
    this.year = year || new Date().getFullYear()
    this.years = this.initHistory(this.year)

    this.$data = {
      year: year
    }
    this.$watch = {
      year: (year, oldYear) => {
        let deltaOnQuotient = Math.abs(Math.floor(year / 10)) - Math.abs(Math.floor(oldYear / 10))
        // 只有商不相等的情况下，才需要更新
        return year;
      }
    }
    this.defineReactive('year')
  }

  // 初始化上下15年 15*2 + 10 = 40
  initHistory(year) {
    // 算出商，退一位计算
    let quotient = Math.abs(Math.floor(year / 10))
    let history = new Array(40);
    for (let i = 0; i < history.length; i++) {
      // 前15 = 12*2 +3 可以保证 当前的十年，是显示区第一行的最后一列
      history[i] = new Year(quotient * 10 - (40 - 10) / 2  + i, []);
    }
    return history;
  }

  // 获取
  getPassYearArray() {

  }
}
