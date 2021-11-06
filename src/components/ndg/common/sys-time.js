import Day from "@/components/ndg/topbar/Day";
import Month from "@/components/ndg/topbar/Month";
import Year from "@/components/ndg/topbar/Year";
import {splitToGroup} from "@/components/ndg/common/common";

let calender = new Date();

const weekName = ['周天', '周一', '周二', '周三', '周四', '周五', '周六',]
const monthDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const monthName = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
export default {
  name: 'time',
  created() {
    this.weekCal.days = this.weekCalender(this.year)
    this.setWeekCal();
    console.log('当前周', this.weekCal.days)
    this.menology = this.monthCalender(this.year, this.month)
    // console.log('指定年月的月历', this.menology)
    this.yearCal = this.yearCalender(this.year)
    console.log('指定年份的年历', this.yearCal)
    this.history = this.initHistory(this.year);
    console.log('上下3年,10年宽度', this.history)
    // 每隔一秒钟更新一次
    this.timer = window.setInterval(() => {
      this.updateTime()
    }, 1000)
  },
  data() {
    return {
      timer: {},
      calender: calender,
      // 星期几
      day: calender.getDay(),
      // 公元后几几年
      year: calender.getFullYear(),
      // 第几月(Date() 默认得出的是下标，所以要加一符合人类语言习惯)
      month: calender.getMonth() + 1,
      // 几号
      date: calender.getDate(),
      time: calender.toTimeString().substring(0, 8),
      hour: calender.getHours(),
      min: calender.getMinutes(),
      sec: calender.getSeconds(),
      monthDayCount: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      // 月历
      menology: [[]],
      // 年历
      yearCal: [],
      // 10年 上下各三年
      history: [],
      // 周历
      weekCal: {
        days: [],
        // 默认从第一周开始
        weekNo: 1,
        duration: '',
      },
    }
  },
  props: {},
  computed: {
    currentTime() {
      let sec = this.sec < 10 ? '0' + this.sec : this.sec;
      let min = this.min < 10 ? '0' + this.min : this.min;
      let hour = this.hour;
      return hour + ':' + min + ':' + sec
    },
    monthName() {
      return monthName[this.month - 1]
    },
    currentDate() {
      let month = this.month < 10 ? '0' + this.month : this.month;
      let day = this.date < 10 ? '0' + this.date : this.date;
      return this.year + '年' + month + '月' + day + '日';
    },
    week() {
      return weekName[this.day];
    },
  },
  watch: {},
  methods: {
    // 更新时间
    updateTime() {
      // 当下时间
      let now = new Date();
      this.year = now.getFullYear();
      this.month = now.getMonth() + 1;
      this.date = now.getDate();
      this.time = now.toTimeString().substring(0, 8);
      this.hour = now.getHours();
      this.min = now.getMinutes();
      this.sec = now.getSeconds();
      this.day = now.getDay();
    },
    // 停止计时
    pauseTime() {
      window.clearInterval(this.timer)
    },
    // 获取这一年的周历
    weekCalender(year) {
      // 计算该年第一天是星期几？
      let startDay = new Date(`1 1, ${year}`)
      // 计算该年最后一天是星期几？
      let lastDay = new Date(`12 31, ${year}`)

      console.log('第一天', startDay, lastDay, '星期：', startDay.getDay(), lastDay.getDay())
      let formerDays = []
      let latterDays = []
      let yearDays = []
      for (let i = 1; i <= startDay.getDay(); i++) {
        const m = this.monthDays(year - 1)[11];
        // 上一年的十二月
        formerDays.push(new Day(year - 1, 12, m - i + 1, startDay.getDay() - i))
      }
      const yearNum = year % 4 == 0 ? 366 : 365
      let md = this.monthDays(year);
      for (let i = 1; i <= yearNum; i++) {
        let groupNo = splitToGroup(i, 0, md);
        // 从一月一号开始
        let date = i;
        for (let j = 0; j < groupNo; j++) {
          date -= md[j]
        }
        let day = (startDay.getDay() + i - 1) % 7
        yearDays.push(new Day(year, groupNo + 1, date, day))
      }
      for (let i = 1; i < 7 - lastDay.getDay(); i++) {
        const m = this.monthDays(year + 1)[0];
        // 下一年的一月
        latterDays.push(new Day(year + 1, 1, i, (lastDay.getDay() + i) % 7))
      }
      return Array.prototype.concat(formerDays.reverse(), yearDays, latterDays)
        .reduce((retArr, day, idx, arr) => {
          if ((idx + 1) % 7 == 0 && idx < arr.length - 1) {
            retArr.push([])
          }
          retArr[Math.floor(idx / 7)].push(day)
          return retArr
        }, [[]])
    },

    nextYear(year) {
      this.yearCal = this.yearCalender(year)
    },
    prevYear(year) {
      this.yearCal = this.yearCalender(year)
    },

    // 获取 某年某月的月历
    monthCalender(year, month) {
      // 计算改月第一周从几号开始，最后一周又是几号结束，依次填充，返回一个7*5的数组
      let monthDays = this.monthDays(year)[month - 1];
      let lastMonthDays = this.monthDays(year)[month - 2 < 0 ? 11 : month - 2];
      // 本月第一天
      let firstDay = new Date(`${month} 1 ${year}`)
      // 本月最后天
      let lastDay = new Date(`${month} ${monthDays} ${year}`)
      let days = new Array(monthDays).fill();
      let formerDays = new Array(firstDay.getDay() - 0).fill()
      // 为了保证六行日期，所以要追加可能必要的7天
      const fillRest = days.length + formerDays.length <= 35 ? 7 : 0
      let latterDays = new Array(fillRest + 6 - lastDay.getDay()).fill()

      // 第一天，最后一天 分别是 周几？
      // console.log(firstDay.getDay(), lastDay.getDay(), formerDays.length, latterDays.length)
      // 上个月末
      for (let index in formerDays) {
        // 如果是一月份，上个(12)月属于去年
        formerDays[index] = new Day(
          month == 1 ? year - 1 : year,
          (month - 1) == 0 ? 12 : month - 1,
          lastMonthDays - parseInt(index),
          (firstDay.getDay() - parseInt(index) - 1) & 7);
      }
      // 本月
      for (let index in days) {
        days[index] = new Day(year, month, parseInt(index) + 1, (firstDay.getDay() + parseInt(index)) % 7)
      }
      // 下个月初
      for (let index in latterDays) {
        // 如果是十二月份，下个(1)月属于下一年
        latterDays[index] = new Day(
          month == 12 ? year + 1 : year,
          month == 12 ? 1 : month + 1,
          parseInt(index) + 1,
          (lastDay.getDay() + 1 + parseInt(index)) % 7);
      }
      // console.log("上月", formerDays, "下月", latterDays, "本月", days)
      return Array.prototype.concat(formerDays.reverse(), days, latterDays)
        .reduce((retArr, day, idx, arr) => {
          // 第几轮？ 从0开始
          let round = Math.floor(idx / 7)
          // console.log(day, idx, round, retArr)
          // 每次遇到7的倍数的（非计算机）下标，加入一个数组
          if ((idx + 1) % 7 == 0 && idx < arr.length - 1) {
            retArr.push([])
          }
          retArr[round].push(day)
          return retArr
        }, [[]])
    },

    // 获取某年的年历
    yearCalender(year) {
      let months = new Array(16)
      /*
      // 循环每一月
      for (let m = 0; m < 12; m++) {
        // 当前月所有的日期
        months[m] = this.monthCalender(year, m + 1);
      }
      // 下一年前期四个月
      for (let m = 0; m < 4; m++) {
        // 当前月所有的日期
        months[m + 12] = this.monthCalender(year + 1, m + 1);
      }
       */
      for (let m = 0; m < 12; m++) {
        months[m] = new Month(year, m + 1)
      }
      for (let m = 0; m < 4; m++) {
        // 当前月所有的日期
        months[m + 12] = new Month(year + 1, m + 1)
      }
      return months;
    },

    // 初始化上下3年
    initHistory(year) {
      let s = Math.abs(Math.floor(year / 10))
      let history = new Array(16);
      for (let i = 0; i < history.length; i++) {
        history[i] = new Year(s * 10 - 3 + i);
      }
      return history;
    },

    // 获取某年的每月日数
    monthDays(year) {
      this.monthDayCount[1] = year % 4 == 0 ? 29 : 28;
      return this.monthDayCount;
    },

    // 矫正一下当前周 是 第几周，属于哪个时间，或者属于哪个时间段
    setWeekCal() {
    },

    // 根据年月日，返回他是这一年的第几周，数字上的，不是数组下标
    calcWeekNo(year, month, date) {
      let dayCounts = 0;
      // 循环前面的月份
      if (month > 1) {
        for (let m = 0; m < month-1; m++) {
          dayCounts += monthDayCount[m]
          if (m == 1 && year % 4 == 0) {
            dayCounts++;
          }
        }
      }
      // console.log('计算第几周：', dayCounts, date, month)
      // 补上本月的日期
      return Math.ceil((dayCounts + date) / 7);
    },

  }
}



