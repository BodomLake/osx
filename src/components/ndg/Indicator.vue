<template>
  <div class="scroll-indicator">
    <template v-for="(unit, ui) in unitArray">
      <div :key="ui" class="unit-box">
        <div class="unit">

        </div>
      </div>
    </template>
  </div>
</template>
<script>
  // 桌面滑动指示器
  export default {
    name: "indicator",
    data() {
      return {
        // 起始数据第一个unit
        currentUnitNo: 0
      };
    },
    props: {
      unitArray: {
        type: Array,
        required: false,
        default: () => {
          return [];
        }
      },
      infiniteScroll: {
        type: Boolean,
        required: false,
        default: true
      }
    },
    model: {
      prop: "unitArray",
      event: "changeUnit"
    }
  };
</script>
<style scoped>
* {
  --bgColor: color antiquewhite;
}
.scroll-indicator {
  /* position: absolute; */
  margin: 0px auto;
  width: 50%;
  height: inherit;
  border-radius: 30%;
  background-color: var(--bgColor);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}
</style>