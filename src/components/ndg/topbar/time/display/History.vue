<template>
  <div class="container">
    <div class="display-zone">
      <template v-for="(row,ri) in displayRows">
        <div class="year-array-row" :data-index="ri" :data-order="row.order"
             :style="{top: offset(row.order), visibility: hidden(row.order), transition: anime}">
          <template v-for="unit in row.yearsGroup">
            <div class="year-array-box" @click="checkYear(unit.year)" :data-year="unit.year"
                 :style="[checkedYearStyle(unit.year), currentYearStyle(unit.year)]">
              <div class="text-center">{{ unit.year }}</div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import {splitArrayByGroup} from "@/components/ndg/common/common";

const today = new Date()
import History from "@/components/ndg/topbar/time/def/History";
// 总计八行，显示4行，每次移动±2行的距离
const displayHistory = splitArrayByGroup(new History().years, 4).map((row, ri) => {
  return ({order: ri, yearsGroup: row})
})
// console.log(displayHistory)
export default {
  name: "History",
  data() {
    return {
      // History模式下，被选中的年份
      checkedTime: today.getFullYear(),
      displayRows: displayHistory,
      animeWard: 'down',
      // 十年一个周期，这是第几个？ 2021 =》 201st
      decadeNo: Math.floor(today.getFullYear() / 10),
    }
  },
  props: {
    // 切换公历的动画时间
    switchDuration: {
      type: Number,
      default: 250,
    },
    leaveDelay: {
      type: Number,
      default: 100
    },

  },
  computed: {
    // 当前显示的年份跨度(10年长度)
    // 从显示区找。能找找一个连贯的10年（？？？0年开始的），
    yearGap() {
      return {
        start: this.decadeNo * 10,
        end: this.decadeNo * 10 + 9
      }
    },
    anime() {
      return `top ${this.switchDuration}ms ease-in-out`
    },
    displayZone() {

      return
    }
  },
  methods: {
    // 重置到今年所在周期
    reset() {
      this.displayRows = displayHistory.years;
    },
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
      this.$emit('goToYearCal', year);
    },
    yearInGapStyle(year) {
      let inGap = year <= this.yearGap.end && year >= this.yearGap.start
      return {color: !inGap ? 'orange' : 'black'}
    },
    // 位移属性
    offset(order) {
      return 100 * order / (this.displayRows.length || 1) + '%'
    },
    // 是否要显示复位的元素
    hidden(order) {
      const upSide = this.animeWard == 'up' && order < 3;
      const downSide = this.animeWard == 'down' && order > 6;
      return upSide || downSide ? 'hidden' : 'initial'
    },
    // 下个十年周期 +(8-2)行 * 4年 = 24年跨度
    nextDecade() {
      this.animeWard = 'down'
      // 根据下一个十年，开始在第几行？根据两者行数差，确定offset
      let offset = 4;
      // 序列号递增1
      this.decadeNo++;
      this.displayRows.forEach((row, ri) => {
        row.order = (row.order - offset) < 0 ? row.order - offset + this.displayRows.length : row.order - offset
      })
      setTimeout(() => {
        let bars = Array.from(document.getElementsByClassName("year-array-row"))
        bars.forEach((bar, bid) => {
          if (bar.dataset.order >= this.displayRows.length - offset) {
            this.displayRows[parseInt(bar.dataset.index)].yearsGroup.forEach((ele, i) => {
              ele.year += this.displayRows.length * 4
            })
          }
        })
      }, 10)
    },
    // 上个十年周期 -(8-2)行 * 4年 = 24年跨度
    prevDecade() {
      this.animeWard = 'up'
      // 根据上一个十年，开始在第几行？根据两者行数差，确定offset
      let offset = 4;
      // 序列号递减1
      this.decadeNo--;
      this.displayRows.forEach((row, ri) => {
        row.order = (row.order + offset) % this.displayRows.length
      })
      setTimeout(() => {
        let bars = Array.from(document.getElementsByClassName("year-array-row"))
        bars.forEach((bar, bid) => {
          if (bar.dataset.order < offset) {
            this.displayRows[parseInt(bar.dataset.index)].yearsGroup.forEach((ele, i) => {
              ele.year -= this.displayRows.length * 4
            })
          }
        })
      }, 10)
    },
  }
}
</script>

<style scoped>

.container {
  position: absolute;
  top: 0;
  left: 0;
  max-height: 100%;
  min-height: 100%;
  height: 100%;
  max-width: 100%;
  min-width: 100%;
}

.display-zone {
  position: absolute;
  top: 0;
  left: 0;
  /* 25% * 10*/
  min-height: 250%;
  max-height: 250%;
  height: 250%;
  max-width: 100%;
  min-width: 100%;
  transform: translateY(-30%);
}

.year-array-row {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  position: absolute;
  min-height: calc(calc(100% / 10));
  max-height: calc(calc(100% / 10));
  width: 100%;
}

.year-array-box {
  min-width: calc(calc(100% / 10));
  max-width: calc(calc(100% / 10));
  min-width: calc(calc(100% / 4));
  max-width: calc(calc(100% / 4));
  box-sizing: border-box;
  user-select: none;
  position: relative;
}

.year-array-box:hover {
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
