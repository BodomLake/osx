<template>
  <div class="ndg-scroll-indicator">
    <div class="ndg-scroll-zone" :style="[overLimitShowStyle]">
      <template v-for="(unit, ui) in box.appGroups">
        <div :key="ui" class="ndg-unit-box" @click="scrollToAppGroup($event, ui)" :style="[unitWidth]" v-if="box.appGroups.length >1">
          <div class="ndg-unit" :class="{'ndg-checked-unit': box.displayNo == ui ,'moreItem': moreItem}">
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
  // BOX内部滑动指示器
  export default {
    name: "indicator",
    data() {
      return {
        moreItem: false,
        offset: 0
      };
    },
    props: {
      box: {
        type: Object,
        default: () => {
          return {};
        }
      },
      infiniteScroll: {
        type: Boolean,
        required: false,
        default: true
      },
      currentAppGroup: {
        type: Number,
        default: 0
      },
      // 默认最大四个游标
      displayMaxNum: {
        type: Number,
        default: 5
      }
    },
    model: {
      prop: "box",
      event: "changeBox"
    },
    computed: {
      unitWidth() {
        let val = 100 / this.displayMaxNum + "%";
        return { "max-width": val, "min-width": val };
      },
      // 如果实际页面 大于等于规定上限，那么显示的手法就是靠左显示flex-start，另外一种就是小于上限：则居中center
      overLimitShowStyle() {
        return {
          "justify-content":
            this.box.appGroups.length < this.displayMaxNum
              ? "center"
              : "flex-start"
        };
      }
    },
    methods: {
      scrollToAppGroup($event, ui) {
        // 更新 v-model
        this.box.displayNo = ui;

        // 平行移动游标指示器（向右）
        let transform = () => {
          // 平移数 * 每次平移的量
          let offsetScale = this.offset * (100 / this.displayMaxNum);
          document.querySelector(
            ".ndg-scroll-zone"
          ).style.transform = `translateX(-${offsetScale}%)`;
        };
        // debugger;
        let displayStartNo = this.offset;
        let displayEndNo = this.offset + this.displayMaxNum - 1;
        //  只有点击了displayZone 显示区域的 左右两端的游标，指示器才会发生位移，也就是offset的变化和 transform
        if (ui == displayStartNo && ui > 0) {
          this.offset--;
          transform();
        }
        if (ui == displayEndNo && ui < this.box.appGroups.length - 1) {
          // 如果点击了最后一个游标
          this.offset++;
          transform();
        }
        // console.log("offset", this.offset);
      }
    }
  };
</script>
<style scoped>
* {
  --bgColor: antiquewhite;
}
.ndg-scroll-indicator {
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  overflow-x: scroll;
  width: 30%;
  height: 5%;
}
.ndg-scroll-zone {
  /* background-color: var(--bgColor); */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  display: flex;
  flex-direction: row;
  /* 如果实际页面 大于等于规定上限，那么显示的手法就是靠左显示，另外一种就是小于上限：则居中center */
  justify-content: flex-start;
  transition: 0.5s all ease-in-out;
  height: 100%;
}
.ndg-scroll-indicator::-webkit-scrollbar {
  height: 0px;
}
.ndg-unit-box {
  position: relative;
}
.moreItem {
  width: 1vmin;
  height: 1vmin;
}
.ndg-unit {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow:  0 0 0.2px 0.2px rgba(0, 0, 0, 0.9) inset;
  border-radius: 50%;
  width: 1.5vmin;
  height: 1.5vmin;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
}
.ndg-checked-unit {
  background-color: rgba(255, 255, 255, 1);
  box-shadow:  0px 0px 0.5px 0.5px rgba(0, 0, 0, 0.2) inset;
}
</style>