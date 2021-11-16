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
    <div class="weeks-container" name="weeks-container-anime">
      <!-- 每一个显示条，预先渲染好，方便无延迟划入划出 -->
      <div v-for="(week, wi) in displayWeek" class="week-days-bar"
           :key="week.id" :id="week.id" :data-index="wi" :data-order="week.order"
           :style="{width: barWidth, left: offset(week.order), visibility: hidden(week.order), transition: anime}">
        <div v-for="day in week.days" class="day-array-box" @click="checkDay($event,day)"
             :style="[todayStyle(day), checkedDayStyle(day)]"
             :data-year="day.year" :data-month="day.month" :data-date="day.date">
          <div class="text-center">
            {{ day.date }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Day from "@/components/ndg/topbar/time/def/Day";
import Week from "@/components/ndg/topbar/time/def/Week";
import {v4 as uuidv4} from "uuid";
// 默认长度为3
const displayWeek = Array.apply(null, {length: 3}).map((week, wi) => {
  if (wi == 0) {
    return new Week(wi).formerWeek(1)
  } else if (wi == 2) {
    return new Week(wi).laterWeek(1)
  } else {
    return new Week(wi)
  }
})
const weekName = ['周天', '周一', '周二', '周三', '周四', '周五', '周六',]
const today = new Date()
export default {
  name: "Week",
  data() {
    return {
      checkedTime: {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        date: today.getDate()
      },
      weekName: weekName,
      // 初始化 左中右三个周期
      displayWeek: displayWeek,
      animeWard: 'left',
    }
  },
  mounted() {
  },
  props: {
    weekCal: {
      require: false,
      type: Array,
      default: () => {
        return Array.apply(null, {length: 7}).map((d, di) => {
          // 默认今天
          return new Day().pass(di - new Date().getDay())
        })
      },
    },
    displayDate: {
      require: false,
      type: Object,
      default: {},
    },
    buffer: {
      require: false,
      type: Number,
      default: 2,
    },
    switchDuration: {
      type: Number,
      default: 250,
    }
  },
  computed: {
    barWidth(wi) {
      return 100 / (this.displayWeek.length || 1) + '%'
    },
    anime() {
      return `left ${this.switchDuration}ms ease-in-out`
    }
  },
  watch: {},
  methods: {
    // 重置到今天所在周期
    reset() {
      this.displayWeek = displayWeek;
    },
    // 今日的背景色
    todayStyle(day) {
      let isToday = (day.year == new Date().getFullYear()
        && day.month == new Date().getMonth() + 1
        && day.date == new Date().getDate())
      return {backgroundColor: isToday ? 'rgba(62, 10, 10, 0.3)' : ''}
    },
    // 被选中的那天的边框
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
    // 位移属性
    offset(order) {
      return 100 * order / (this.displayWeek.length || 1) + '%'
    },
    // 是否要显示复位的元素
    hidden(order) {
      const leftHide = this.animeWard == 'right' && order == 0;
      const rightHide = this.animeWard == 'left' && order == this.displayWeek.length - 1;
      return leftHide || rightHide ? 'hidden' : 'initial'
    },
    // 向左拉动
    nextWeek() {
      // console.log('进入下一周')
      // 改动order
      this.animeWard = 'left'
      // 先修改order
      this.displayWeek.forEach((week, wi) => {
        week.order = (week.order - 1) < 0 ? week.order - 1 + this.displayWeek.length : week.order - 1
      })
      // 处理Bar最后一个week
      setTimeout(() => {
        let bars = Array.from(document.getElementsByClassName('week-days-bar'))
        bars.forEach((bar, bid) => {
          // 找出中位之后所有的bar 的data-order
          if (this.buffer / 2 < bar.dataset.order) {
            this.displayWeek[parseInt(bar.dataset.index)].laterWeek(3)
          }
        })
      }, 1)

    },
    // 向右拉动
    prevWeek() {
      // console.log('进入上一周')
      this.animeWard = 'right'
      this.displayWeek.forEach((week, wi) => {
        week.order = (week.order + 1) % this.displayWeek.length
      })
      // 处理Bar第一个week
      setTimeout(() => {
        let bars = Array.from(document.getElementsByClassName('week-days-bar'))
        bars.forEach((bar, bid) => {
          // 找出中位之前所有的bar 的data-order
          if (this.buffer / 2 > bar.dataset.order) {
            this.displayWeek[parseInt(bar.dataset.index)].formerWeek(3)
          }
        })
      }, 1)
    },
  }
}
</script>

<style scoped>
@import "display.css";

.weeks-container {
  width: 300%;
  box-sizing: border-box;
  color: black;
  height: 50%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  position: relative;
  left: -100%;
  /*  transition: left 1550ms ease-in-out;*/
}

.week-days-bar {
  min-width: 33.33%;
  max-width: 33.33%;
  min-height: 100%;
  max-height: 100%;
  /*  border: 1px green solid;*/
  position: absolute;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  box-sizing: border-box;
  color: black;
  opacity: 1;
}

.text-center {
  width: 100%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  user-select: none;
}
</style>
<style scoped>

</style>
