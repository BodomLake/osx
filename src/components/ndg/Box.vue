<template>
  <div class="ndg-scroll-box" :style="{'width': calcBoxWidth(box.appGroups),
                   'transform': calcBoxOffsetX(box.appGroups, box.displayNo)}">
    <!-- 属于文件夹，默认九宫格模式，分割为9个一组，每一组作为一个大方格，含有9个或者以下的方格 -->
    <template v-for="(group, gid) in box.appGroups">
      <div class="ndg-app-group" :key="gid" v-if="gridMode" :style="{'visibility': box.displayNo != gid ? 'hidden': ''}"
           ref="group">
        <!-- 九个app -->
        <template v-for="(app, aid) in group">
          <div class="ndg-app" :key="app.id" :name="app.name" :data-group="gid" :id="app.id" :draggable="enableDrag"
               :class="{'shakeAnime': enableDrag && gid == box.displayNo}"
               @dragover="handleDragOver($event, gid, aid)" @dragstart="handleDragStart($event, gid, aid)">
            <my-icon :className="app.name" v-if="app.name!==''" ></my-icon>
            <div class="ndg-app-desc" v-if="showAppName">
              {{ app.name }}
            </div>
          </div>
        </template>
      </div>
    </template>
    <!-- 不开启宫格模式 -->
    <div v-if="!gridMode" :class="{'shakeAnime': enableDrag}" style="width: 100%;height: 100%">
      <my-icon :className="box.appGroups[0][0].name"></my-icon>
    </div>
  </div>
</template>
<script>
// 存放app的盒子
import MyIcon from "./MyIcon.vue";

export default {
  name: "box",
  beforeCreate() {
  },
  components: {
    MyIcon: MyIcon
  },
  model: {
    prop: "box",
    event: "changeBox"
  },
  data() {
    return {
      // 生命周期防抖器
      updatedTimer: 0,
      // app之间拖拽跨过-节流计时器
      appDOTimer: 0
    };
  },
  mounted() {
    // 立刻执行
    this.locateApps();
  },
  updated() {
    // 防抖 100ms
    let debounceTime = 100;
    if (Date.now() - this.updatedTimer < debounceTime) {
      // 重置为当前时间
      this.updatedTimer = Date.now();
      return;
    }
    setTimeout(() => {
      // 重置所有
      this.locateApps(true);
      // console.log("定位BOX完成, 不重置悬停状态");
    }, debounceTime);
  },
  computed: {
    // 宫格模式 如果被覆盖就一定要开启，如果没有覆盖的情况，就要根据app的数量判断
    gridMode() {
      if (this.box.covered) {
        return true;
      } else {
        let appCount = this.box.appGroups.reduce((count, cur) => {
          return count + cur.length;
        }, 0);
        // console.log("app计数", appCount);
        // 无论是总数大于1
        return appCount > 1;
      }
    }
  },
  props: {
    box: {
      type: Object,
      default: {}
    },
    showAppName: {
      type: Boolean,
      default: false
    },
    enableDrag: {
      type: Boolean,
      default: false
    },
    throttleTime: {
      type: Number,
      default: 200
    }
  },
  methods: {
    calcBoxWidth(arr) {
      if (arr && arr.length > 0) {
        return 100 * arr.length + "%";
      } else {
        return "100%";
      }
    },
    calcBoxOffsetX(arr, displayNo) {
      let len = arr.length;
      return `translateX(-${displayNo * (100 / len)}%)`;
    },
    locateApps(refreshFlag) {
      // console.log(this.$refs.group ? this.$refs["group"] : "none");
      let groups = this.$refs["group"];
      // 如果没有分组或者没有进入宫格模式
      if (!groups || !this.gridMode) {
        return;
      }
      Array.from(groups).forEach((group, gid) => {
        let apps = group.children;
        Array.from(apps).forEach((app, aid) => {
          // 获取当前app的坐标和尺寸
          let appRect = app.getBoundingClientRect();
          // console.log(app.getAttribute("name"), appRect);
          // 如果没有生命 refreshFlag 就是默认初始化而不是刷新
          if (!refreshFlag || refreshFlag == undefined) {
            this.$set(this.box.appGroups[gid][aid], "DOMRect", appRect);
            this.$set(this.box.appGroups[gid][aid], "suspendTime", 0);
          } else {
            // 刷新定位状态
            this.box.appGroups[gid][aid].DOMRect = appRect;
            this.box.appGroups[gid][aid].suspendTime = 0;
          }
        });
      });
    },
    handleDragOver($event, groudIndex, appIndex) {
      $event.preventDefault();
      // 节流100ms执行一次
      const throttleTime = this.throttleTime;
      if (Date.now() - this.appDOTimer < throttleTime) {
        return;
      }
      // 新一轮计时，重新获取目前时间
      this.appDOTimer = Date.now();
      setTimeout(() => {
        console.log("--appDOTimer--", groudIndex, appIndex);
      }, throttleTime);
    },
    handleDragStart($event, groudIndex, appIndex) {
    }
  }
};
</script>
<style scoped>
.ndg-scroll-box {
  display: flex;
  flex-direction: row;
  height: 100%;
  position: relative;
  transition: 0.5s all ease-in-out;
  /* transform: translateX(0%); */
}

.ndg-app-group {
  width: 100%;
  height: 100%;
  border-radius: 10%;
  display: flex;
  flex-direction: row;
  flex-grow: 10;
  flex-wrap: wrap;
  align-self: center;
  align-content: flex-start;
  flex-grow: 1;
  transition: 0.5s all ease-in-out;
  /* z-index: -1; */
}

.ndg-app {
  box-sizing: border-box;
  flex-grow: 1;
  border-radius: 3%;
  cursor: pointer;
  position: relative;
  /* 限制宽度 */
  min-width: calc(calc(100% / 3));
  max-width: calc(calc(100% / 3));
  /* 限制高度 */
  min-height: calc(calc(100% / 3));
  max-height: calc(calc(100% / 3));
}

.ndg-app-desc {
  font-size: 6px;
  position: absolute;
  bottom: 0%;
  left: 50%;
  transform: translateX(-50%);
}

/* 实现抖动 */
@keyframes shakeAnime {
  0% {
    transform: scale(1) rotate(0) translate(0.3px, 0);
  }

  25% {
    transform: scale(1) rotate(-0.5deg) translate(0, 0.3px);
  }

  50% {
    transform: scale(1) rotate(0.5deg) translate(-0.3px, 0);
  }

  75% {
    transform: scale(1) rotate(-0.5deg) translate(0, -0.3px);
  }

  100% {
    transform: scale(1) rotate(0) translate(0, 0);
  }
}

.shakeAnime {
  animation: shakeAnime 0.5s both infinite;
}
</style>
