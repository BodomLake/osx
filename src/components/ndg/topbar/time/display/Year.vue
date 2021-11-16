<template>
  <div class="container" name="row-array-container0">
    <div class="display-zone">
      <template v-for="(row, ri) in displayRows">
        <div class="row-array" :key="ri" :data-index="ri" :data-order="row.order"
             :style="{top: offset(row.order), visibility: hidden(row.order), transition: anime}">
          <template v-for="(month,mi) in row.months">
            <!-- 每一行，都是4个月 -->
            <div class="row-array-box" @click="checkMonth(month)"
                 :data-month="month.month" :data-year="month.year"
                 :style="[currentMonthStyle(month), checkedMonthStyle(month),sameMonthStyle(month)]">
              <div class="text-center">
                <!--              {{ month.year }}-->
                {{ month.monthName }}
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>

  </div>
</template>
<script>
import Month from "@/components/ndg/topbar/time/def/Month";
import Year from "@/components/ndg/topbar/time/def/Year";
import {inRegion, splitArrayByGroup, swapEle} from "@/components/ndg/common/common";

const today = new Date()
const displayYearRows = [];
splitArrayByGroup(
  Array.prototype.concat(
    Array.apply(null, {length: 3}).map((year, yi) => {
      return new Year(new Date().getFullYear() - 2 / 2 + yi).months
    }),
    new Year(new Date().getFullYear() + 2).months.slice(0, 4)
  ).flat(), 4)
  .forEach((r, ri) => {
    displayYearRows.push({months: r, order: ri})
  })
export default {
  name: "Year",
  data() {
    return {
      // 被点击，选中的时间是那个月，那一年
      checkedTime: new Month(today.getFullYear(), today.getMonth() + 1),
      // 总计9（3*3）行，也就是（3*4）*3个月 36个月，
      // 跨度3年（去年，今年，明年，后年的1-4月）被规划为10行()，每次滑动±3行的距离
      displayRows: displayYearRows,
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
    // 切换年份的动画时间
    switchDuration: {
      type: Number,
      default: 250,
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
  computed: {
    anime() {
      return `top ${this.switchDuration}ms ease-in-out`
    }
  },
  mounted() {
  },
  methods: {
    // 重置到今天所在周期
    reset() {
      this.displayRows = displayRows;
    },
    // 跳到明年 上拉
    nextYear() {
      this.animeWard = 'down'
      // 先修改order
      this.displayRows.forEach((row, ri) => {
        row.order = (row.order - 3) < 0 ? row.order - 3 + this.displayRows.length : row.order - 3
      })
      this.displayYear++;
      // 处理 7 8 9的下标
      setTimeout(() => {
        let bars = Array.from(document.getElementsByClassName('row-array'))
        bars.forEach((bar, bid) => {
          // 找出中位之后所有的bar 的data-order
          if (bar.dataset.order >= 7) {
            this.displayRows[parseInt(bar.dataset.index)].months.forEach((month, mi) => {
              month.laterMonth(this.displayRows.length * 4)
            })
          }
        })
      }, 10)
    },
    // 跳到去年 下拉
    prevYear() {
      this.animeWard = 'up'
      // 先修改order 除了  7 8 9 全部下拉， 0 1 2
      this.displayRows.forEach((row, ri) => {
        row.order = (row.order + 3) % this.displayRows.length
      })
      this.displayYear--;
      // 处理 0 1 2的下标
      setTimeout(() => {
        let bars = Array.from(document.getElementsByClassName('row-array'))
        bars.forEach((bar, bid) => {
          // 找出中位之后所有的data-order为 0 1 2 的bar的 下标
          if (bar.dataset.order < 3) {
            // 找到数组下标
            let barIndex = parseInt(bar.dataset.index)
            this.displayRows[barIndex].months.forEach((month, mi) => {
              // 下一年
              month.year = this.displayDate.year - 1;
              // 后四个月
              month.month = 4 * bar.dataset.order + mi + 1
            })
          }
        })
      }, 10)
    },
    // 位移属性
    offset(order) {
      return 100 * order / (this.displayRows.length || 1) + '%'
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
      // setTimeout(() => {
      this.$emit('goToMenology', month.year, month.month)
      // }, this.leaveDelay)
    },
    // 让当年的月份呈现黑色
    sameMonthStyle(month) {
      let sameMonth = month.year == this.displayDate.year
      return {color: !sameMonth ? 'orange' : 'black'}
    },
    // 是否要显示复位的元素
    hidden(order) {
      const upSide = this.animeWard == 'up' && order < 3;
      const downSide = this.animeWard == 'down' && order > 6;
      return upSide || downSide ? 'hidden' : 'initial'
    },
    setYearCal(year) {
      // 设置当前显示的年份
      this.displayYear = year;
      // 修改数据锁定这一年的情况，以及上下
      this.displayRows.forEach((row, ri) => {
        row.months.forEach((month, mi) => {
          // console.log(year - this.displayYear, month.year)
          month.year += year - this.displayYear
        })
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100%;
  /* 25% * 10*/
  max-height: 100%;
  height: 100%;
  max-width: 100%;
  min-width: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}

.display-zone {
  min-height: 250%;
  /* 25% * 10*/
  max-height: 250%;
  height: 250%;
  max-width: 100%;
  min-width: 100%;
  top: 0;
  left: 0;
  position: absolute;
  transform: translateY(-30%);
}

.row-array {
  max-height: 10%;
  min-height: 10%;
  height: 10%;
  max-width: 100%;
  min-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  /*  border: 1px solid crimson;*/
  position: absolute;
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
  /*  border: 1px solid crimson;*/
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

.row-array-container-move {
  transition: 0.5s all ease-in-out;
}
</style>
