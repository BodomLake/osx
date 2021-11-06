// 单个月为一个周期
export default {
  computed: {

  },
  methods: {
    // 当月的日期数字是黑色的，其他月的日期数字是橘色的
    currentMonthDayStyle(day) {
      return {color: day.month != this.displayDate.month ? 'orange' : 'black'}
    },
    // 被选中的日期样式
    checkedDayStyle(day) {
      let isChecked = (day.year == this.checkedTime.year &&
        day.month == this.checkedTime.month &&
        day.date == this.checkedTime.date)
      return {border: isChecked ? '3px solid white' : ''}
    },
  }
}
