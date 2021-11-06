// 一周为一个周期 53个周期做一年
const calPeriod = {
  WEEK: 0,
  MONTH: 1,
  YEAR: 2,
  HISTORY: 3,
}
export default {
  computed: {
    // 现在是第几周
    currentWeek() {
      return this.weekCal.days[this.displayDate.weekNo - 1];
    },
    // 周历模式下的样式：主要是高度被修改了
    weekCalModeStyle() {
      let height = this.calPeriod == calPeriod.WEEK ? '15%' : '45%'
      return {maxHeight: height, minHeight: height}
    },
  },
  methods: {

  }
}
