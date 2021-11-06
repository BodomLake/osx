<template>
  <div class="time" ref="timeBar">
    <div class="display" @click="toggleCalender($event)">
      <div style="padding: 1px 0">
        {{ week }} {{ currentTime }}
      </div>
    </div>
    <div class="calender-container" :style="{'visibility': showCalender ? 'visible': 'hidden' }">
      <div class="main" :style="{'transform': calenderOffset}" draggable="false">

        <div class="now">
          <div style="height: 65%;width: 100%; position: relative;color: white;font-size: 5vmin;">
            <div class="text-center" style="text-align: left">
              <span>{{ currentTime }}</span>
              <span style="font-size: 3vmin;">{{ hour >= 12 ? 'PM' : 'AM' }}</span>
            </div>
          </div>
          <div style="height: 35%;width: 100%;position: relative;color: white;font-size: 2vmin;">
            <div class="text-center" style="width: 95%;text-align: left" @click="returnToday($event)">
              {{ year }} 年 {{ day }} 号 {{ monthName }} {{ week }}
            </div>
          </div>
        </div>


        <div class="selector-bar">
          <div class="unit-select hoverHightLight" style="position: relative" @click="switchCalMode($event)">
            <!-- 当月 月历-->
            <template v-if="calMode == 1">
              <div class="text-center" style="width: 85%">{{ displayMonthName }} {{ displayDate.year }}</div>
            </template>
            <!-- 当年 12个月，以及下年四个月-->
            <template v-if="calMode == 2">
              <div class="text-center" style="width: 85%">{{ displayDate.year }}</div>
            </template>
            <!-- 上下8年，一共显示2*8个年头，但是选择条中的所指示的是该年所在的十年，该十年前三年加上后上年，这是以下需要显示的 -->
            <template v-if="calMode == 3">
              <div class="text-center" style="width: 85%">{{ yearGap }}</div>
            </template>
            <!-- 按照周历显示 -->
            <template v-if="calMode == 0">
              <div class="text-center" style="width: 85%">{{ weekCal.duration }} 第{{ displayDate.weekNo }}周</div>
            </template>
          </div>
          <div class="up-arrow" @click="prevPeriod($event)">
            <div class="arrow upward"></div>
          </div>
          <div class="down-arrow" @click="nextPeriod($event)">
            <div class="arrow downward"></div>
          </div>
        </div>

        <div class="day-array" :style="[weekCalModeStyle]">
          <!-- 当月 月历-->
          <template v-if="calMode == 1">
            <!-- 星期X栏目 -->
            <div class="day-array-row">
              <!-- 月份模式 -->
              <template v-for="(week,i) in weekName">
                <div class="day-array-box" :data-index="i">
                  <div class="text-center">{{ week }}
                  </div>
                </div>
              </template>
            </div>
            <!-- 月历模式：展示每一个月 -->
            <template v-for="week in menology">
              <div class="day-array-row">
                <template v-for="day in week">
                  <div class="day-array-box" style="position: relative" @click="checkDay($event,day)"
                       :style="[currentMonthDayStyle(day),checkedDayStyle(day), todayStyle(day)]">
                    <div class="text-center">
                      {{ day.date }}
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </template>

          <!-- 年历模式，展示本年12个月以及下一年的前四个月 -->
          <template v-if="calMode == 2">
            <div style="display: flex; flex-direction: row; flex-wrap: wrap; height: 100%; width: 100%">
              <template v-for="month in yearCal">
                <div class="month-array-box" :data-month="month.month" :data-year="month.year">
                  <div class="text-center">
                    {{ month.monthName }}
                  </div>
                </div>
              </template>
            </div>
          </template>

          <!-- 上下三年，10年跨度 -->
          <template v-if="calMode == 3">
            <template v-for="i in 4">
              <div class="year-array-row">
                <template v-for="j in 4">
                  <div class="year-array-box" @click="checkYear(history[(i - 1) * 4 + j - 1].year)"
                       :style="[checkedYearStyle(history[(i - 1) * 4 + j - 1].year),
                       currentYearStyle(history[(i - 1) * 4 + j - 1].year)]">
                    <div class="text-center">
                      {{ history[(i - 1) * 4 + j - 1].year }}
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </template>

          <!-- 周历模式-->
          <template v-if="calMode == 0">
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
          </template>

        </div>

        <!-- 事件提醒列表 -->
        <div class="event-day">
          {{ checkedTime.month }} 月 {{ weekName[checkedTime.day] }} {{ checkedTime.date }}号
        </div>
        <div class="event-add">
          <input v-model="enterEvents">
        </div>
        <div class="event-list">
          <div v-for="i in 15">

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import TimeMixin from '../common/sys-time'
// 日历周期
const calMode = {
  WEEK: 0,
  MONTH: 1,
  YEAR: 2,
  HISTORY: 3,
}
const today = new Date();
const weekName = ['周天', '周一', '周二', '周三', '周四', '周五', '周六',]
const monthName = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

export default {
  name: "Time",
  data() {
    return {
      showCalender: false,
      weekName: weekName,
      // 默认被选中的是今天
      checkedTime: {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        date: today.getDate(),
        day: today.getDay()
      },
      // History模式下，被选中的年份
      checkedYear: today.getFullYear(),

      enterEvents: '',
      // 默认月历，加载这一年的所有月份表
      calMode: calMode.WEEK,
      displayDate: {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        date: today.getDate(),
        day: today.getDay(),
        /*        hour: today.getHours(),
                min: today.getMinutes(),
                sec: today.getSeconds(),
                time: today.getTime(),*/
        // 确定显示的这周是该年的第几周
        weekNo: this.calcWeekNo(today.getFullYear(), today.getMonth() + 1, today.getDate())
      }
    }
  },
  beforeCreate() {
  },
  mounted() {
  },
  mixins: [TimeMixin],
  computed: {
    timeBarRect() {
      return this.$refs['timeBar'] ? this.$refs['timeBar'].$el.getBoundingClientRect() : {};
    },
    calenderOffset() {
      return this.showCalender ? 'translate(0%)' : 'translateY(-100%)';
    },
    // 目前选择显示的 月份名称
    displayMonthName() {
      return monthName[this.displayDate.month]
    },
    // 当前显示的年份跨度(10年长度)
    yearGap() {
      let s = Math.abs(Math.floor(this.displayDate.year / 10))
      return `${s * 10}-${s * 10 + 9}`
    },
    weekCalModeStyle() {
      let height = this.calMode == calMode.WEEK ? '15%' : '45%'
      return {maxHeight: height, minHeight: height}
    },
    currentWeek() {
      return this.weekCal.days[this.displayDate.weekNo - 1];
    },
  },
  created() {

  },
  methods: {
    // 开合 日历组件
    toggleCalender($event) {
      $event.stopPropagation();
      this.showCalender = !this.showCalender;
    },
    // 让显示区的点击日期，回到今天
    returnToday($event) {
      $event.stopPropagation();
      let today = new Date()
      this.displayDate.year = today.getFullYear()
      this.displayDate.month = today.getMonth() + 1
      this.displayDate.date = today.getDate()
      this.displayDate.day = today.getDay()
      this.displayDate.weekNo = this.calcWeekNo(today.getFullYear(), today.getMonth() + 1, today.getDate())
      this.menology = this.monthCalender(today.getFullYear(), today.getMonth() + 1)
    },
    // 当月的数字是黑色的，其他月的是橘色的
    currentMonthDayStyle(day) {
      return {color: day.month != this.displayDate.month ? 'orange' : 'black'}
    },
    // 被选中的日期样式
    checkedDayStyle(day) {
      let isChecked = (day.year == this.checkedTime.year && day.month == this.checkedTime.month && day.date == this.checkedTime.date)
      return {border: isChecked ? '3px solid white' : ''}
    },
    // 被选中的年份的样式
    checkedYearStyle(year) {
      return {border: year == this.checkedYear ? '3px solid white' : '1px solid transparent'}
    },
    // 选中一个年份
    checkYear(year) {
      this.checkedYear = year
    },
    // 今年所显示的样式
    currentYearStyle(year) {
      return {backgroundColor: year == this.year ? 'rgba(62, 10, 10, 0.3)' : ''}
    },

    prevPeriod($event) {
      $event.stopPropagation();
      switch (this.calMode) {
        case calMode.WEEK:
          this.prevWeek();
          break;
        case calMode.MONTH:
          if (this.displayDate.month == 1) {
            this.displayDate.month = 12;
            this.displayDate.year -= 1;
          } else {
            this.displayDate.month -= 1;
          }
          this.menology = this.monthCalender(this.displayDate.year, this.displayDate.month)
          break;
        case calMode.YEAR:
          this.displayDate.year -= 1;
          this.prevYear(this.displayDate.year);
          break;
        case calMode.HISTORY:

        default:
      }
    },
    nextPeriod($event) {
      $event.stopPropagation();
      switch (this.calMode) {
        case calMode.WEEK:
          this.nextWeek();
          break;
        case calMode.MONTH:
          if (this.displayDate.month == 12) {
            this.displayDate.month = 1;
            this.displayDate.year += 1;
          } else {
            this.displayDate.month += 1;
          }
          this.menology = this.monthCalender(this.displayDate.year, this.displayDate.month)
          break;
        case calMode.YEAR:
          this.displayDate.year += 1;
          this.nextYear(this.displayDate.year);
          break;
        case calMode.HISTORY:

        default:
      }
    },
    // 周前移一周
    prevWeek() {
      this.displayDate.weekNo--;
    },
    // 周历后移一周
    nextWeek() {
      this.displayDate.weekNo++;
    },
    todayStyle(day) {
      let isToday = (day.year == new Date().getFullYear()
        && day.month == new Date().getMonth() + 1
        && day.date == new Date().getDate())
      return {backgroundColor: isToday ? 'rgba(62, 10, 10, 0.3)' : ''}
    },
    checkDay($event, day) {
      $event.stopPropagation();
      Object.keys(day).forEach((key) => {
        if (this.checkedTime.hasOwnProperty(key)) {
          this.checkedTime[key] = day[key]
        }
      })
    },
    switchCalMode($event) {
      $event.stopPropagation();
      console.log(this.calMode)
      if (this.calMode == calMode.MONTH) {
        this.calMode = calMode.YEAR
      } else if (this.calMode == calMode.YEAR) {
        this.calMode = calMode.HISTORY
      } else if (this.calMode == calMode.HISTORY) {
        this.calMode = calMode.WEEK;
      } else if (this.calMode == calMode.WEEK) {
        this.calMode = calMode.MONTH;
      }
    },
    monthNameArray(month) {
      return monthName[month > 12 ? month - 13 : month]
    },

  }
  ,
}
</script>

<style scoped>
* {
  font-family: 'Poppins, sans-serif'
}

.time {
  position: absolute;
  right: 0px;
  height: 100%;
  opacity: 1;
  color: black;
  align-items: flex-end;
}

.display {
  font-size: 2vmin;
  color: black;
  user-select: none;
  font-weight: 500;
  height: 100%;
  padding: 1px 0;
}

.calender-container {
  width: 42vmin;
  height: 75vmin;
  position: fixed;
  right: 0;
  z-index: 1;
  top: 4vh;
  overflow: hidden;
  border-radius: 1%;
}

.main {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 100%;
  width: 100%;
  transition: all 500ms ease-in-out;
  z-index: 2;
  background-image: url("../../../assets/Beach.jpg");
  background-position: center;
  box-shadow: 1px -1px 1px 0.5px rgba(62, 10, 10, 0.3) inset;
}

.main > .now {
  min-height: 15%;
  max-height: 15%;
  width: 100%;
  /*background-color: cyan;*/
  opacity: 1;
  padding-left: 5%;
}

/*.main > .calender {
  max-height: 55%;
  width: 100%;
  border-bottom: 1px silver groove;
  opacity: 1;
}*/

.selector-bar {
  max-height: 7%;
  min-height: 7%;
  display: flex;
  border-top: 1px silver groove;
  transition: all 500ms ease-in-out;
}

.selector-bar > :nth-child(1) {
  width: 70%;
  /*  background-color: greenyellow;*/
}

.selector-bar > :nth-child(2) {
  width: 15%;
  /* background-color: lightskyblue;*/
}

.selector-bar > :nth-child(3) {
  width: 15%;
  /*  background-color: lightseagreen;*/
}

.arrow {
  border-left: 1px white solid;
  border-top: 1px white solid;
  width: 5px;
  height: 5px;
  position: relative;
  top: 50%;
  left: 50%;
}

.upward {
  transform: translate(-50%, -50%) rotate(45deg);
}

.downward {
  transform: translate(-50%, -50%) rotate(-135deg);
}

.day-array {
  display: flex;
  width: 92%;
  margin: 0 auto;
  flex-direction: column;
  /*  background-color: skyblue;*/
  transition: all 500ms ease-in-out;
}

.hoverHightLight {
  color: whitesmoke;
}

.hoverHightLight:hover {
  color: white;
}

.day-array-row {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  min-height: calc(calc(100% / 7));
  width: 100%;
  box-sizing: border-box;
  color: black;
  /*  background-color: sandybrown;*/
  /*  border-bottom: 1px greenyellow groove;*/
}

.month-array-row {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  min-height: calc(calc(100% / 4));
}

.year-array-row {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  min-height: calc(calc(100% / 4));
}

.day-array-box {
  min-width: calc(calc(100% / 7));
  height: 100%;
  /*  border-right: 1px #03e9f4 groove;*/
  box-sizing: border-box;
  position: relative;
  font-weight: 400;
  user-select: none;
  font-size: 2vmin;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}

.month-array-box {
  min-width: calc(calc(100% / 4));
  max-width: calc(calc(100% / 4));
  max-height: calc(calc(100% / 4));
  box-sizing: border-box;
  user-select: none;
  position: relative;
}

.year-array-box {
  min-width: calc(calc(100% / 4));
  box-sizing: border-box;
  height: 100%;
  user-select: none;
  position: relative;
}

.text-center {
  width: 100%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  user-select: none;
}

.main > .event-day {
  min-height: 5%;
  max-height: 5%;
  text-align: left;
  padding-left: 5%;
  user-select: none;
}

.main > .event-add {
  min-height: 6%;
  max-height: 6%;
}

input {
  width: 90%;
  height: 70%;
  opacity: 0.75;
  color: black;
  border-radius: 5px;
}

input:focus {
  background-color: ghostwhite;
  color: black;
}

.main > .event-add ::selection {
  background-color: yellowgreen;
}

.main > .event-list {
  height: 60%;
  overflow-y: auto;
  flex-grow: 1;
  /*  background-color: greenyellow;*/
}

.main > .event-list::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.main > .event-list > div {
  /*  border-top: 1px solid sandybrown;*/
  position: relative;
  height: 8vmin;
}

.main > .event-list > div::before {
  content: '';
  height: 90%;
  width: 3px;
  background-color: red;
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
