<template>
  <div class="container">
    <div class="day-array-row">
      <template v-for="(week,i) in weekName">
        <div class="day-array-box" :data-index="i">
          <div class="text-center">{{ week }}
          </div>
        </div>
      </template>
    </div>
    <template v-for="(week,wi) in menology">
      <div class="day-array-row" :key="wi">
        <template v-for="(day,di) in week">
          <div class="day-array-box" @click="checkDay($event,day)"
               :style="[currentMonthDayStyle(day),checkedDayStyle(day), todayStyle(day)]" :key="di">
            <div class="text-center">
              {{ day.date }}
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import Day from "@/components/ndg/topbar/time/def/Day";

const weekName = ['周天', '周一', '周二', '周三', '周四', '周五', '周六',]
const today = new Date()
export default {
  name: 'Month',
  data() {
    // 默认被选中的是今天
    return {
      checkedTime: new Day(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getDay()),
      weekName: weekName,
    }
  },
  model: {
    prop: 'menology',
    event: 'changeMenology'
  },
  props: {
    menology: {
      require: true,
      type: Array,
      default: [],
    },
    displayDate: {
      require: false,
      type: Object,
      default: {},
    }
  },
  computed: {},
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
    // 周历模式，日历模式 背景色
    todayStyle(day) {
      let isToday = (day.year == new Date().getFullYear()
        && day.month == new Date().getMonth() + 1
        && day.date == new Date().getDate())
      return {backgroundColor: isToday ? 'rgba(62, 10, 10, 0.3)' : ''}
    },
    // 选中一天
    checkDay($event, day) {
      $event.stopPropagation();
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
@import 'display.css';
</style>
