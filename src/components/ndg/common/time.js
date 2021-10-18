let calender = new Date();
const weekName = ['周天', '周一', '周二', '周三', '周四', '周五', '周六',]
export default {
  name: 'time',
  data() {
    return {
      timer: {},
      calender: calender,
      day: calender.getDay(),
      year: calender.getFullYear(),
      month: calender.getMonth() + 1,
      date: calender.getDate(),
      time: calender.toTimeString().substring(0, 8),
      hour: calender.getHours(),
      min: calender.getMinutes(),
      sec: calender.getSeconds(),
      monthDayCount: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    }
  },
  computed: {
    currentTime() {
      let sec = this.sec < 10 ? '0' + this.sec : this.sec;
      let min = this.min < 10 ? '0' + this.min : this.min;
      let hour = this.hour;
      return hour + ':' + min + ':' + sec
    },
    currentDate() {
      let month = this.month < 10 ? '0' + this.month : this.month;
      let day = this.date < 10 ? '0' + this.date : this.date;
      return this.year + '年' + month + '月' + day + '日';
    },
    week() {
      return weekName[this.day];
    },
    // 获取当周周历
    weekCalender() {
      let days = new Array(7)
      for (let i = 0; i < 7; i++) {
        days[i] = this.date + (i - this.day);
      }
      return days;
    },
    // 获取当月月历
    monthCalender() {
      let days = new Array(this.monthDayCount[this.month - 1]);
      for (let d = 0; d < days.length; d++) {
        days[d] = d + 1;
      }
      return days;
    },
    // 获取当年年历
    yearCalender() {
      let months = new Array(12)
      // 循环每一月
      for (let m = 0; m < 12; m++) {
        // 当前月所有的日期
        let days = new Array(this.monthDayCount[m])
        for (let d = 0; d < days.length; d++) {
          days[d] = d + 1;
        }
        months[m] = days;
      }
      return months;
    }

  },
  watch: {
    "year": {
      handler: function (val, oldVal) {
        if (val != oldVal) {
          // 先判断是否是闰年，平年,如果是二月份就要加一天
          this.monthDayCount[1] = this.val % 4 == 0 ? 29 : 28;
        }
      },
      immediate: true,
    }
  },
  created() {
    // 每隔一秒钟更新一次
    this.timer = setInterval(() => {
      this.updateTime()
    }, 1000)
  },
  methods: {
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
  }
}
