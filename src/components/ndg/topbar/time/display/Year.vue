<template>
  <div class="container" style="">
    <template v-for="(row, ri) in displayYears">
      <div class="row-array">
        <template v-for="(month,mi) in row">
          <div class="row-array-box" @click="checkMonth(month)"
               :data-month="month.month" :data-year="month.year"
               :style="[currentMonthStyle(month), checkedMonthStyle(month),sameMonthStyle(month)]">
            <div class="text-center">
              {{ month.monthName }}
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
<script>
// 16(12+4)个月为一个周期 一次12个月，也就是一年
import Month from "@/components/ndg/topbar/time/def/Month";
import Year from "@/components/ndg/topbar/time/def/Year";
import {splitArrayByGroup} from "@/components/ndg/common/common";

const today = new Date()
export default {
  name: "Year",
  data() {
    return {
      // 被点击，选中的时间是那个月，那一年
      checkedTime: new Month(today.getFullYear(), today.getMonth() + 1),
      // 总计9（3*3）行，也就是（3*4）*3个月 36个月，
      // 跨度3年（去年，今年，明年）被规划为9行，每次滑动±3行的距离
      displayYears: [],
      // 默认显示今年
      displayYear: new Date().getFullYear(),
      // 默认下一年
      animeWard: 'down'
    }
  },
  props: {
    // 今年年历
    yearCal: {
      require: false,
      type: Object,
      default: () => {
        return new Year()
      },
    },
    // 显示的日期
    displayDate: {
      require: false,
      type: Object,
      default: {},
    },
    // 点击进入某个月的动画延迟
    leaveDelay: {
      type: Number,
      default: 100
    },
    //
    buffer: {
      require: false,
      type: Number,
      default: 2,
    },
  },
  computed: {},
  mounted() {
    // 初始化
    this.displayYears = this.initDisplayYears()
    console.log(this.displayYears)
  },
  methods: {
    // 显示区数据的初始化
    initDisplayYears() {
      // 默认返回
      return splitArrayByGroup(Array.apply(null, {length: 3}).map((year, yi) => {
        return new Year(new Date().getFullYear() - this.buffer / 2 + yi).months
      }).flat(), 4)
      //  三年时间，分为9组（行），
    },
    currentMonthStyle(month) {
      let sameMonth = month.month == today.getMonth() + 1 && month.year == today.getFullYear()
      return {backgroundColor: sameMonth ? 'rgba(62, 10, 10, 0.3)' : ''}
    },
    checkedMonthStyle(month) {
      let sameMonth = month.month == this.checkedTime.month && month.year == this.checkedTime.year
      return {border: sameMonth ? '3px solid white' : ''}
    },
    // 选中一个月份
    checkMonth(month) {
      this.checkedTime.month = month.month;
      this.checkedTime.year = month.year;
      // 修改父组件的属性
      setTimeout(() => {
        this.$emit('goToMenology', month.year, month.month)
      }, this.leaveDelay)
    },
    // 让当年的月份呈现黑色
    sameMonthStyle(month) {
      let sameMonth = month.year == this.displayDate.year
      return {color: !sameMonth ? 'orange' : 'black'}
    },
  }
}
</script>

<style scoped>
.container {
  min-height: 100%;
  max-height: 225%;
  height: 225%;
  max-width: 100%;
  min-width: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  top: 0%;
  transform: translateY(-33.33%);
}

.row-array {
  max-height: 11.11%;
  min-height: 11.11%;
  height: 11.11%;
  max-width: 100%;
  min-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
/*  border: 1px solid crimson;*/
}

.row-array-box {
  min-height: 100%;
  max-height: 100%;
  height: 100%;
  max-width: 25%;
  min-width: 25%;
  width: 25%;
  box-sizing: border-box;
  position: relative;
  border: 1px solid crimson;
}
.row-array-box:hover {
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
