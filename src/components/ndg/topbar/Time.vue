<template>
  <div class="time">
    <div style="display: inline">{{currentDate}}</div>
    <div style="display: inline">{{currentTime}}</div>
  </div>
</template>

<script>
import {Timer} from "@/components/ndg/timer";

let calender = new Date();
const weeks = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六',]
export default {
  name: "Time",
  data() {
    return {
      timer: new Timer(),
      calender: calender,
      day: calender.getDay(),
      year: calender.getFullYear(),
      month: calender.getMonth() + 1,
      date: calender.getDate(),
      time: calender.toTimeString().substring(0, 8),
      hour: calender.getHours(),
      min: calender.getMinutes(),
      sec: calender.getSeconds(),
    }
  },
  computed: {
    currentTime() {
      let sec = this.sec < 10 ? '0' + this.sec : this.sec;
      let min = this.min < 10 ? '0' + this.min : this.min;
      let hour = this.hour < 10 ? '0' + this.hour : this.hour;
      return hour + ':' + min + ':' + sec
    },
    currentDate() {
      let week = weeks[this.day];
      let month = this.month < 10 ? '0' + this.month : this.month;
      let day = this.date < 10 ? '0' + this.date : this.date;
      return this.year + '-' + month + '-' + day;
    },
  },
  created() {
    setInterval(() => {
      this.updateTime()
    }, 1000)
  },
  methods: {
    updateTime() {
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
    resolveZero(){

    }
  },
  filters: {
  }
}
</script>

<style scoped>

</style>
