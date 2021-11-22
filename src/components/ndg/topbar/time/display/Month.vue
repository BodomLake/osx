<template>
  <div class="container">
    <div class="display-zone">
      <!-- 一周之内的每天 -->
      <div class="day-array-row">
        <template v-for="(week,i) in weekName">
          <div class="day-array-box" :data-index="i">
            <div class="text-center">{{ week }}
            </div>
          </div>
        </template>
      </div>
      <!-- 显示区的外层容器 -->
      <div class="weeks-container" name="weeks-container-anime">
        <!-- 15个周，6 + 6 + 6 主屏显示6个(从第七个开始，也就是本月第一周，每次滑动都要抵达那个月的第一周-->
        <div class="day-array-row-container">
          <div v-for="(row,ri) in displayRows" class="week-days-array-row"
               :key="ri" :data-index="ri" :data-order="row.order"
               :style="{top: offset(row.order),visibility: hidden(row.order), transition: anime}">
            <template v-for="(day,di) in row.days">
              <div class="day-array-box" @click="checkDay($event,day)"
                   :style="[currentMonthDayStyle(day),checkedDayStyle(day), todayStyle(day)]"
                   :key="di" :data-year="day.year" :data-month="day.month" :data-date="day.date"
                   :data-weekNo="day.weekNo">
                <div class="text-center">
                  {{ day.date }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Day from "@/components/ndg/topbar/time/def/Day";
import Week from "@/components/ndg/topbar/time/def/Week";

const weekName = ['周天', '周一', '周二', '周三', '周四', '周五', '周六',]
const monthDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const today = new Date()


function initMenology(year, month) {
  year = year || today.getFullYear()
  month = month || today.getMonth() + 1
  const firstDate = new Date(year, month - 1, 1);
  // 先找到本月第一周
  const menology = [];
  // 前推到今天所在月份的一号
  // const firstDay = new Day().pass(-(today.getDate() - 1))
  const firstDay = new Day(firstDate.getFullYear(), firstDate.getMonth() + 1, firstDate.getDate(), firstDate.getDay())
  console.log(firstDay)
  // 相差多少周，weekDelta是一个正数
  const weekDelta = Math.floor((today.getDate() + firstDay.day - 1) / 7)
  // console.log('相差多少周', weekDelta)
  const startWeek = new Week(6, new Day(firstDay.year, firstDay.month, firstDay.date, firstDay.day))
  // 前面6个星期
  const formerWeeks = new Array(6).fill().map((ele, wi) => {
    return (new Week(wi + 0, new Day(firstDay.year, firstDay.month, firstDay.date, firstDay.day))).formerWeek(6 - wi)
  })
  // 后面9(4+5)个星期
  const laterWeeks = new Array(11).fill().map((week, wi) => {
    return (new Week(wi + 7, new Day(firstDay.year, firstDay.month, firstDay.date, firstDay.day))).laterWeek(wi + 1)
  })
  menology.push(...formerWeeks)
  menology.push(startWeek)
  menology.push(...laterWeeks)
  // 总计15个周总计105天，远远大于3个月(<=93<14*7)的长度
  // console.log(formerWeeks, laterWeeks, menology)
  return menology;
}

export default {
  name: 'Month',
  data() {
    // 默认被选中的是今天
    return {
      checkedTime: new Day(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getDay()),
      weekName: weekName,
      displayRows: initMenology(),
      animeWard: 'down',
      // 现在显示的 哪一年 哪一月？
      displayDate: {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
      },
      monthDayCount: monthDayCount,
    }
  },
  props: {
    // 切换年份的动画时间
    switchDuration: {
      type: Number,
      default: 250,
    },
  },
  watch: {
    "displayDate.month": {
      handler: function (val, oldVal) {
        console.log(val, oldVal)
        if (val == 0) {
          this.displayDate.year -= 1
          this.displayDate.month = 12;
        }
        if (val == 13) {
          this.displayDate.year += 1
          this.displayDate.month = 1;
        }
        // 避免重复上传通知
        if (val > 0 && val < 13) {
          this.$emit('switchPeriod', this.displayDate.year, this.displayDate.month)
        }
      },
    }
  },
  computed: {
    anime() {
      return `top ${this.switchDuration}ms ease-in-out`
    }
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
      console.log('触发', 'checkDay')
      this.$emit('chooseDay', day)
      Object.keys(day).forEach((key) => {
        if (this.checkedTime.hasOwnProperty(key)) {
          this.checkedTime[key] = day[key]
        }
      })
    },
    // 位移属性
    offset(order) {
      return 100 * order / (this.displayRows.length || 1) + '%'
    },
    // 是否要显示复位的元素
    hidden(order) {
      const upSide = this.animeWard == 'up' && order < 4;
      const downSide = this.animeWard == 'down' && order > 11;
      return upSide || downSide ? 'hidden' : 'initial'
    },
    // 滚动到下个月的第一周
    nextMonth() {
      this.animeWard = 'down'
      let offset = 4
      // 计算到下个月的第一周需要多少周
      const firstDay = new Date(this.displayDate.year, this.displayDate.month - 1, 1)
      // 本月第一天是星期几（前面的天数）+ 本月长度 是7的多少倍
      // debugger;
      offset = Math.floor((firstDay.getDay() + this.monthDays(this.displayDate.year)[firstDay.getMonth()]) / 7)
      console.log('上滑', offset)
      this.displayRows.forEach((row, ri) => {
        row.order = (row.order - offset) < 0 ? row.order - offset + this.displayRows.length : row.order - offset
      })
      this.displayDate.month++;
      setTimeout(() => {
        let rows = Array.from(document.getElementsByClassName("week-days-array-row"))
        rows.forEach((bar, bid) => {
          if (bar.dataset.order >= this.displayRows.length - offset) {
            // console.log('修改index=', parseInt(bar.dataset.index), '修改order', bar.dataset.order)
            this.displayRows[parseInt(bar.dataset.index)].laterWeek(18)
          }
        })
      }, 10)
    },
    // 滚动到上个月的第一周
    prevMonth() {
      this.animeWard = 'up'
      let offset = 4
      // 计算到上个月的第一周到本月第一周需要多少周
      const firstDay = new Date(this.displayDate.year, this.displayDate.month - 2, 1)
      // debugger;
      offset = Math.floor((firstDay.getDay() + this.monthDays(this.displayDate.year)[firstDay.getMonth()]) / 7)
      console.log('下滑', offset)
      this.displayRows.forEach((row, ri) => {
        row.order = (row.order + offset) % this.displayRows.length
      })
      this.displayDate.month--;
      setTimeout(() => {
        let bars = Array.from(document.getElementsByClassName("week-days-array-row"))
        bars.forEach((bar, bid) => {
          if (bar.dataset.order < offset) {
            // console.log('修改index=', parseInt(bar.dataset.index), '修改order', bar.dataset.order)
            this.displayRows[parseInt(bar.dataset.index)].formerWeek(18)
          }
        })
      }, 10)
    },
    // 获取某年的每月日数
    monthDays(year) {
      this.monthDayCount[1] = year % 4 == 0 ? 29 : 28;
      return this.monthDayCount;
    },
    goToMenology(year, month) {
      this.displayRows = initMenology(year, month)
      this.displayDate.month = month
      this.displayDate.year = year
    },
  }
}
</script>

<style scoped>
.container {
  max-height: 100%;
  min-height: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
}

.display-zone {
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  max-height: 100%;
  height: 100%;
  max-width: 100%;
  min-width: 100%;
  overflow: hidden;
  /*  transform: translateY(-20%);*/
}

.weeks-container {
  max-height: calc(calc(100% * 6 / 7));
  min-height: calc(calc(100% * 6 / 7));
  height: calc(calc(100% * 6 / 7));
  overflow: hidden;
}

.day-array-row-container {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  position: relative;
  box-sizing: border-box;
  height: 300%;
  min-height: 300%;
  max-height: 300%;
  width: 100%;
  color: black;
  transform: translateY(calc(-100% * 6 / 18));
}

.day-array-row {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  max-height: calc(calc(100% / 7));
  min-height: calc(calc(100% / 7));
  height: calc(calc(100% / 7));
  width: 100%;
  box-sizing: border-box;
  color: black;
}

.week-days-array-row {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  position: absolute;
  max-height: calc(calc(100% / 18));
  min-height: calc(calc(100% / 18));
  height: calc(calc(100% / 18));
  width: 100%;
  box-sizing: border-box;
  color: black;
}

.day-array-box {
  min-width: calc(calc(100% / 7));
  max-width: calc(calc(100% / 7));
  width: calc(calc(100% / 7));
  min-height: 100%;
  max-height: 100%;
  /*  border-right: 1px #03e9f4 groove;*/
  box-sizing: border-box;
  position: relative;
  font-weight: 400;
  user-select: none;
  font-size: 2vmin;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}

.day-array-box:hover {
  border: 1px solid white;
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
