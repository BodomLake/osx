<template>
  <div style="display: flex; flex-direction: row; flex-wrap: wrap; height: 100%; width: 100%">
    <template v-for="month in yearCal">
      <div class="month-array-box" @click="checkMonth(month)"
           :data-month="month.month" :data-year="month.year"
           :style="[currentMonthStyle(month), checkedMonthStyle(month),sameMonthStyle(month)]">
        <div class="text-center">
          {{ month.monthName }}
        </div>
      </div>
    </template>
  </div>
</template>
<script>
// 16(12+4)个月为一个周期 一次12个月，也就是一年
import Month from "@/components/ndg/topbar/time/def/Month";

const today = new Date()
export default {
  name: "Year",
  data() {
    return {
      // 被点击，选中的时间是那个月，那一年
      checkedTime: new Month(today.getFullYear(), today.getMonth() + 1),
    }
  },
  model: {
    prop: 'yearCal',
    event: 'changeYearCal'
  },
  props: {
    yearCal: {
      require: true,
      type: Array,
      default: {},
    },
    displayDate: {
      require: false,
      type: Object,
      default: {},
    }
  },
  computed: {},
  methods: {
    currentMonthStyle(month) {
      let sameMonth = month.month == this.month && month.year == this.year
      return {backgroundColor: sameMonth ? 'rgba(62, 10, 10, 0.3)' : ''}
    },
    checkedMonthStyle(month) {
      let sameMonth = month.month == this.checkedTime.month && month.year == this.checkedTime.year
      return {border: sameMonth ? '3px solid white' : ''}
    },
    // 选中一个月份
    checkMonth(month) {
      this.checkedTime.month = month.month;
      this.checkedTime.year = month.year;
      // 修改父组件的属性
      this.$emit('goToMenology', month.year, month.month)
    },
    // 让当年的月份呈现黑色
    sameMonthStyle(month) {
      let sameMonth = month.year == this.displayDate.year
      return {color: !sameMonth ? 'orange' : 'black'}
    },
  }
}
</script>

<style scoped>
@import 'display.css';
</style>
