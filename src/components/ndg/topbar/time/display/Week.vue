<template>
  <div class="container">
    <!-- 星期X栏目 -->
    <div class="day-array-row" style="height: 50%">
      <!-- 星期模式 -->
      <template v-for="(week,i) in weekName">
        <div class="day-array-box" :data-index="i">
          <div class="text-center">{{ week }}
          </div>
        </div>
      </template>
    </div>
    <div class="day-array-row" style="height: 50%">
      <template v-for="day in currentWeek">
        <div class="day-array-box" style="position: relative"
             :style="[todayStyle(day), checkedDayStyle(day)]"
             @click="checkDay($event,day)"
             :data-year="day.year" :data-month="day.month" :data-date="day.date">
          <div class="text-center">
            {{ day.date }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Day from "@/components/ndg/topbar/time/def/Day";

const weekName = ['周天', '周一', '周二', '周三', '周四', '周五', '周六',]
const today = new Date()
export default {
  name: "Week",
  data() {
    return {
      checkedTime: new Day(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getDay()),
      weekName: weekName,
    }
  },
  model: {
    prop: 'weekCal',
    event: 'changeWeekCal'
  },
  props: {
    weekCal: {
      require: true,
      type: Array,
      default: [],
    },
    displayDate: {
      require: false,
      type: Object,
      default: {},
    },
  },
  computed: {
    // 现在是第几周
    currentWeek() {
      return this.weekCal[this.displayDate.weekNo - 1];
    },
  },
  methods: {
    todayStyle(day) {
      let isToday = (day.year == new Date().getFullYear()
        && day.month == new Date().getMonth() + 1
        && day.date == new Date().getDate())
      return {backgroundColor: isToday ? 'rgba(62, 10, 10, 0.3)' : ''}
    },
    checkedDayStyle(day) {
      let isChecked = (day.year == this.checkedTime.year &&
        day.month == this.checkedTime.month &&
        day.date == this.checkedTime.date)
      return {border: isChecked ? '3px solid white' : ''}
    },
    // 选中一天
    checkDay($event, day) {
      $event.stopPropagation();
      setTimeout(() => {
        this.$emit('chooseDay', day)
      }, this.leaveDelay)
      Object.keys(day).forEach((key) => {
        if (this.checkedTime.hasOwnProperty(key)) {
          this.checkedTime[key] = day[key]
        }
      })
    },
  }
}
</script>

<style scoped>
@import "display.css";
</style>
