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

          <div class="unit-select hoverHightLight" style="position: relative" @click="switchCalPeriod($event)">
            <!-- 当月 -->
            <template v-if="calPeriod == 1">
              <div class="text-center" style="width: 85%">{{ displayMonthName }} {{ displayDate.year }}</div>
            </template>
            <!-- 当年 12个月，以及下年四个月-->
            <template v-if="calPeriod == 2">
              <div class="text-center" style="width: 85%">{{ displayDate.year }}</div>
            </template>
            <!-- 上下8年，一共显示2*8个年头，但是选择条中的所指示的是该年所在的十年，该十年前三年加上后上年，这是以下需要显示的 -->
            <template v-if="calPeriod == 3">
              <div class="text-center" style="width: 85%">{{ yearGap.start }} - {{ yearGap.end }}</div>
            </template>
            <!-- 按照周历显示 -->
            <template v-if="calPeriod == 0">
              <div class="text-center" style="width: 85%">第{{ displayDate.weekNo }}周</div>
            </template>
          </div>

          <div class="up-arrow" @click="prevPeriod($event)">
            <div class="arrow upward"></div>
          </div>
          <div class="down-arrow" @click="nextPeriod($event)">
            <div class="arrow downward"></div>
          </div>
        </div>

        <div class="day-array-zone" :style="[weekCalModeStyle]">
          <!-- 当月 月历-->
          <transition name="period-switch">
            <template v-if="calPeriod === 1">
              <Month v-model="menology" :display-date="displayDate" @chooseDay="chooseDay" ref="month"></Month>
            </template>
          </transition>

          <!-- 展示本年12个月以及下一年的前四个月 -->
          <transition name="period-switch">
            <template v-if="calPeriod === 2">
              <Year v-model="yearCal" :display-date="displayDate" @goToMenology="goToMenology" ref="year"></Year>
            </template>
          </transition>

          <!-- 上下三年，10年跨度 -->
          <transition name="period-switch">
            <template v-if="calPeriod === 3">
              <History v-model="history" :display-date="displayDate" @goToYearCal="goToYearCal" ref="history"></History>
            </template>
          </transition>

          <!-- 周历模式-->
          <transition name="period-switch">
            <template v-if="calPeriod === 0">
              <Week :display-date="displayDate" @chooseDay="chooseDay" :switch-duration="switchDuration" ref="week"></Week>
            </template>
          </transition>
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
import Day from "@/components/ndg/topbar/time/def/Day";
import TimeMixin from '../../common/sys-time'
// 分割一部分代码:各个周期对应的子组件
import Month from './display/Month'
import Year from "./display/Year";
import History from "./display/History";
import Week from "./display/Week";
import {splitToGroup} from "@/components/ndg/common/common";

// 日历周期
const calPeriod = {
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
      // 显示开关
      showCalender: false,
      // 星期的名字
      weekName: weekName,
      // 被选中的时间
      checkedTime: new Day(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getDay()),
      // 输入的事件
      enterEvents: '',
      // 默认月历，加载这一年的所有月份表
      calPeriod: calPeriod.WEEK,
      // selector-bar 选择条中显示的 年月日
      displayDate: {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        date: today.getDate(),
        day: today.getDay(),
        /*
        hour: today.getHours(),
        min: today.getMinutes(),
        sec: today.getSeconds(),
        time: today.getTime(),
        */
        // 确定显示的这周是该年的第几周 [1,53]
        weekNo: 0,
      },
      throttleTimer: 0,
    }
  },
  props: {
    switchDuration: {
      type: Number,
      default: 300,
    }
  },
  beforeCreate() {
  },
  mounted() {
  },
  components: {
    'Month': Month,
    'Year': Year,
    'Week': Week,
    'History': History,
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
      return monthName[this.displayDate.month - 1]
    },
    // 周历模式下的样式：主要是高度被修改了
    weekCalModeStyle() {
      let height = this.calPeriod == calPeriod.WEEK ? '15%' : '45%'
      return {maxHeight: height, minHeight: height}
    },
    // 当前显示的年份跨度(10年长度)
    yearGap() {
      let s = Math.abs(Math.floor((this.displayDate.year || today.getFullYear()) / 10))
      return {
        start: s * 10,
        end: s * 10 + 9
      }
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

      this.displayDate.weekNo = 0
      this.menology = this.monthCalender(this.year, this.month)
      this.yearCal = this.yearCalender(this.year)
    },
    // 响应点击事件，进入上一个周期
    prevPeriod($event) {
      $event.stopPropagation();
      switch (this.calPeriod) {
        case calPeriod.WEEK:
          this.prevWeek();
          break;
        case calPeriod.MONTH:
          this.prevMonth()
          break;
        case calPeriod.YEAR:
          this.prevYear();
          break;
        case calPeriod.HISTORY:
          this.prevDecade();
          break;
        default:
      }
    },
    // 响应点击事件，进入下一个周期
    nextPeriod($event) {
      $event.stopPropagation();
      switch (this.calPeriod) {
        case calPeriod.WEEK:
          this.nextWeek();
          break;
        case calPeriod.MONTH:
          this.nextMonth()
          break;
        case calPeriod.YEAR:
          this.nextYear();
          break;
        case calPeriod.HISTORY:
          this.nextDecade();
          break;
        default:
      }
    },
    // 周前移一周
    prevWeek() {
      if (Date.now() - this.throttleTimer < this.switchDuration) {
        return;
      }
      this.$refs['week'].prevWeek()
      this.throttleTimer = Date.now()
    },
    // 周历后移一周
    nextWeek() {
      if (Date.now() - this.throttleTimer < this.switchDuration) {

        return;
      }
      this.$refs['week'].nextWeek()
      this.throttleTimer = Date.now()
    },
    // 上个月
    prevMonth() {
      if (this.displayDate.month == 1) {
        this.displayDate.month = 12;
        // 进入上一年
        this.prevYear()
      } else {
        this.displayDate.month -= 1;
      }
      this.menology = this.monthCalender(this.displayDate.year, this.displayDate.month)
    },
    // 下个月
    nextMonth() {
      if (this.displayDate.month == 12) {
        this.displayDate.month = 1;
        // 进入下一年
        this.nextYear();
      } else {
        this.displayDate.month += 1;
      }
      this.menology = this.monthCalender(this.displayDate.year, this.displayDate.month)
    },
    // 下一年
    nextYear() {
      this.displayDate.year += 1;
      this.yearCal = this.yearCalender(this.displayDate.year)
    },
    // 上一年
    prevYear() {
      this.displayDate.year -= 1;
      this.yearCal = this.yearCalender(this.displayDate.year)
    },
    // 上个十年
    prevDecade() {
      this.displayDate.year -= 10
      this.history = this.initHistory(this.displayDate.year)
    },
    // 下个十年
    nextDecade() {
      this.displayDate.year += 10
      this.history = this.initHistory(this.displayDate.year)
    },
    // 切换Calender的周期
    switchCalPeriod($event) {
      $event.stopPropagation();
      console.log(this.calPeriod)
      if (this.calPeriod == calPeriod.MONTH) {
        this.calPeriod = calPeriod.YEAR
      } else if (this.calPeriod == calPeriod.YEAR) {
        this.calPeriod = calPeriod.HISTORY
      } else if (this.calPeriod == calPeriod.HISTORY) {
        this.calPeriod = calPeriod.WEEK;
      } else if (this.calPeriod == calPeriod.WEEK) {
        this.calPeriod = calPeriod.MONTH;
      }
    },
    monthNameArray(month) {
      return monthName[month > 12 ? month - 13 : month]
    },
    // <Year>进入指定的某年某月的月历表
    goToMenology(year, month) {
      this.displayDate.month = month;
      this.displayDate.year = year;
      console.log(year, month)
      this.menology = this.monthCalender(year, month)
      this.calPeriod = calPeriod.MONTH;
    },
    // <History>进入指定的年历表
    goToYearCal(year) {
      this.displayDate.year = year;
      this.yearCal = this.yearCalender(year)
      this.calPeriod = calPeriod.YEAR;
    },
    chooseDay(day) {
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
  background-image: url("../../../../assets/Beach.jpg");
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

.day-array-zone {
  display: flex;
  width: 92%;
  margin: 0 auto;
  flex-direction: column;
  /*  background-color: skyblue;*/
  transition: all 500ms ease-in-out;
  position: relative;
}

.hoverHightLight {
  color: whitesmoke;
}

.hoverHightLight:hover {
  color: white;
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
<style scoped>
.period-switch-leave {
  transform: scale(1.0);
  opacity: 1;
}

.period-switch-leave-to {
  transform: scale(0.5);
  opacity: 0.1;
}

.period-switch-leave-active {
  transition: all 0.3s;
  transition-delay: 0.1s;
}

.period-switch-enter {
  transform: scale(0.5);
  opacity: 0.1;
}

.period-switch-enter-to {
  transform: scale(1.0);
  opacity: 1;
}

.period-switch-enter-active {
  transition: all 0.3s;
  transition-delay: 0.3s;
}

</style>
