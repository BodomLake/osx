// 16(10+3+3) 年 为一个周期 一次 10年
export default {
  computed: {
    // 当前显示的年份跨度(10年长度)
    yearGap() {
      let s = Math.abs(Math.floor(this.displayDate.year / 10))
      return `${s * 10}-${s * 10 + 9}`
    },
  },
  methods: {
    // 被选中的年份的样式
    checkedYearStyle(year) {
      return {border: year == this.checkedYear ? '3px solid white' : '1px solid transparent'}
    },
    // 选中一个年份
    checkYear(year) {
      this.checkedYear = year
    },
  }
}
