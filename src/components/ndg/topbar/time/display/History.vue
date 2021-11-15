<template>
  <div class="container">
    <template v-for="i in 4">
      <div class="year-array-row">
        <template v-for="j in 4">
          <div class="year-array-box" @click="checkYear(history[(i - 1) * 4 + j - 1].year)"
               :style="[checkedYearStyle(history[(i - 1) * 4 + j - 1].year),
                        currentYearStyle(history[(i - 1) * 4 + j - 1].year),
                        yearInGapStyle(history[(i - 1) * 4 + j - 1].year)]">
            <div class="text-center">
              {{ history[(i - 1) * 4 + j - 1].year }}
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
const today = new Date()
// 总计八行，显示4行，每次移动±2行的距离
export default {
  name: "History",
  data() {
    return {
      // History模式下，被选中的年份
      checkedTime: today.getFullYear(),
    }
  },
  model: {
    prop: 'history',
    event: 'changeHistory',
  },
  props: {
    history: {
      type: Array,
      require: true,
      default: [],
    },
    displayDate: {
      require: false,
      type: Object,
      default: {},
    },
    leaveDelay: {
      type: Number,
      default: 100
    }
  },
  computed: {
    // 当前显示的年份跨度(10年长度)
    yearGap() {
      let s = Math.abs(Math.floor(this.displayDate.year / 10))
      return {
        start: s * 10,
        end: s * 10 + 9
      }
    },
  },
  methods: {
    // 今年所显示的样式
    currentYearStyle(year) {
      return {backgroundColor: year == today.getFullYear() ? 'rgba(62, 10, 10, 0.3)' : ''}
    },
    // 被选中的年份的样式
    checkedYearStyle(year) {
      return {border: year == this.checkedTime ? '3px solid white' : ''}
    },
    // 选中一个年份
    checkYear(year) {
      this.checkedTime = year
      setTimeout(()=>{
        this.$emit('goToYearCal', year);
      }, this.leaveDelay)
    },
    yearInGapStyle(year) {
      let inGap = year <= this.yearGap.end && year >= this.yearGap.start
      return {color: !inGap ? 'orange' : 'black'}
    }
  }
}
</script>

<style scoped>
@import 'display.css';
</style>
