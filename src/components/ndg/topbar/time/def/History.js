import Reactive from "@/components/ndg/common/Reactive";
import Year from "@/components/ndg/topbar/time/def/Year";

export default class History extends Reactive {
  constructor(year) {
    super();
    this.year = year || new Date().getFullYear()
    this.history = this.initHistory(this.year)
    this.$data = {}
    this.$watch = {}
    this.defineReactive('')
  }

  // 初始化上下3年
  initHistory(year) {
    let s = Math.abs(Math.floor(year / 10))
    let history = new Array(32);
    for (let i = 0; i < history.length; i++) {
      history[i] = new Year(s * 10 - 11 + i, []);
    }
    return history;
  }
}
