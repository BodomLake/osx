import Day from "@/components/ndg/topbar/time/def/Day";
import Month from "@/components/ndg/topbar/time/def/Month";
import Year from "@/components/ndg/topbar/time/def/Year";
import {splitToGroup} from "@/components/ndg/common/common";

let calender = new Date();

const weekName = ['周天', '周一', '周二', '周三', '周四', '周五', '周六',]
const monthDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const monthName = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
export default {
  name: 'time',
  created() {
    this.weekCal = this.initWeekCal()
    console.log('本周', this.weekCal)
    this.menology = this.monthCalender(this.year, this.month)
    // console.log('指定年月的月历', this.menology)
    this.yearCal = this.yearCalender(this.year)
    // console.log('指定年份的年历', this.yearCal)
    this.history = this.initHistory(this.year);
    // console.log('上下3年,10年宽度', this.history)
    // 每隔一秒钟更新一次
    this.clockTimer = window.setInterval(() => {
      this.updateTime()
    }, 1000)
  },
  data() {
    return {
      // 时钟计时器
      clockTimer: {},
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
      // 默认本周周历
      weekCal: [],
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
      window.clearInterval(this.clockTimer)
    },
    // 获取这一年的周历
    weekCalender(year) {
      // 计算该年第一天是星期几？
      let startDay = new Date(`1 1, ${year}`)
      // 计算该年最后一天是星期几？
      let lastDay = new Date(`12 31, ${year}`)
      let formerDays = []
      let latterDays = []
      let yearDays = []
      for (let i = 1; i <= startDay.getDay(); i++) {
        // 上一年的十二月(31天)
        formerDays.push(new Day(year - 1, 12, 31 - i + 1, startDay.getDay() - i))
      }
      const yearNum = year % 4 == 0 ? 366 : 365
      let md = this.monthDays(year);
      for (let i = 1; i <= yearNum; i++) {
        // 用递归算出这一天是几月份的
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

    // 返回今天所在的周的7天
    initWeekCal() {
      return Array.apply(null, {length: 7}).map((d, di) => {
        let day = new Day()
        day.pass(di - new Date().getDay())
        return day
      })
    },

    // 根据年月日，返回他是这一年的第几周，数字上的，不是数组下标
    calcWeekNo(year, month, date) {
      // console.log(year, month, date)
      // 第一个星期四 算作 每一年第一个星期的标志
      let startDay = new Date(`1 1, ${year}`)
      let startThursday;
      // let firstSunday;
      // 1月1号在第一个星期四之前，可能是 星期三 星期二 星期一 星期天
      if (startDay.getDay() <= 3) {
        startThursday = new Date(`1 ${4 - startDay.getDay()}, ${year}`)
      } else if (startDay.getDay() > 3) {
        startThursday = new Date(`1 ${11 - startDay.getDay()}, ${year}`)
      }

      let day = new Date(`${month} ${date}, ${year}`)
      let dayCounts = (day.getTime() - startThursday.getTime()) / 1000 / 3600 / 24 + 4
      // TODO 逻辑有问题
      return Math.ceil(dayCounts / 7);
    },
  }
}
