<template>
  <div class="ndg-scroll-box" :style="{'width': calcBoxWidth, 'transform': calcBoxOffsetX}" ref="group">

    <!-- 属于文件夹，默认九宫格模式，分割为9个一组，每一组作为一个大方格，含有9个或者以下的方格 -->
    <template v-for="(group, gid) in box.appGroups">
      <div class="ndg-app-group" :key="gid" v-if="gridMode"
           :style="{'visibility': box.displayNum != gid ? 'hidden': ''}">
        <transition-group class="ndg-app-container" name="ndg-app-shift" :duration="switchDuration" tag="div"
                          :draggable="false">
          <template v-for="(app, aid) in group">
            <!-- 默认九个app一组 -->
            <div class="ndg-app" :key="app.id" :name="app.name" :data-group="gid" :id="app.id" :draggable="enableDrag"
                 :class="{'shakeAnime': enableDrag && gid == box.displayNum}"
                 @dragover="handleDragOver($event, gid, aid)"
                 @dragstart="handleDragStart($event, gid, aid)">
              <my-icon :className="app.name" v-if="app.name!==''"></my-icon>
              <div class="ndg-app-desc" v-if="showAppName">
                {{ app.name }}
              </div>
            </div>
          </template>
          <div :name="rectIdArr1[gid]" :key="rectIdArr1[gid]"
               :style="{'max-height': '33.33%', 'min-height': '33.33%', 'width': domRectArr1[gid] }"></div>
          <div :name="rectIdArr2[gid]" :key="rectIdArr2[gid]" :style="{'width': '100%','height': domRectArr2[gid]}"
               style="height: auto"></div>
        </transition-group>
      </div>
    </template>

    <!-- 不开启宫格模式 -->
    <div v-if="!gridMode" :class="{'shakeAnime': enableDrag}" style="width: 100%;height: 100%"
         :id="box.appGroups[0][0].id"
         :name="box.appGroups[0][0].name">
      <my-icon :className="box.appGroups[0][0].name"></my-icon>
    </div>

  </div>
</template>
<script>
// 存放app的盒子
import MyIcon from "./MyIcon.vue";
import {v4 as uuidv4} from "uuid";

;
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
      appDOTimer: 0,
      draggingApp: {
        groupIndex: 0,
        appIndex: 0
      },
    };
  },
  computed: {
    // 宫格模式 如果被覆盖就一定要开启，如果没有覆盖的情况，就要根据app的数量判断
    gridMode() {
      if (this.box.covered || this.usedInModal) {
        return true;
      } else {
        let appCount = this.box.appGroups.flat(2).filter(app => {
          return app.name != "";
        }).length;
        // console.info("该BOX实际有效的app计数", appCount);
        // 无论是总数大于1
        return appCount > 1;
      }
    },
    calcBoxOffsetX(arr, displayNum) {
      // (box.appGroups, box.displayNum)
      let len = this.box.appGroups.length;
      return `translateX(-${this.box.displayNum * (100 / len)}%)`;
    },
    calcBoxWidth() {
      let arr = this.box.appGroups;
      if (arr && arr.length > 0) {
        return 100 * arr.length + "%";
      } else {
        return "100%";
      }
    },
    domRectArr1() {
      let arr = [];
      const col = 3;
      const row = 3;
      this.box.appGroups.forEach((group, did) => {
        let boxNum = group.length;
        if (boxNum % col == 0) {
          arr.push('0%')
        } else {
          let width = (col - boxNum % col) / col * 100 + '%';
          arr.push(width)
        }
      })
      return arr;
    },
    domRectArr2() {
      let arr = [];
      // 列 3
      let col = 3
      // 行 3
      let row = 3
      this.box.appGroups.forEach((group, did) => {
        let boxNum = group.length;
        let height = (row - Math.ceil(boxNum / col)) / row * 100 + '%'
        arr.push(height)
      })
      return arr;
    },
    rectIdArr1() {
      return this.box.appGroups.map(g => {
        return uuidv4()
      })
    },
    rectIdArr2() {
      return this.box.appGroups.map(g => {
        return uuidv4()
      })
    },
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
    },
    switchDuration: {
      type: Number,
      default: 200
    },
    // 被当成Modal选中的情况
    usedInModal: {
      type: Boolean,
      default: false,
    }
  },
  watch: {
    box: {
      handler: function (newBOX, oldBOX) {
        this.locateApps();
      },
      immediate: false,
      depp: true
    }
  },
  mounted() {
    // 立刻执行
    this.locateApps();
  },
  updated() {
    // 防抖 100ms
    let throttleTime = 100;
    if (Date.now() - this.updatedTimer < throttleTime) {
      return;
    }
    this.updatedTimer = Date.now();
    window.setTimeout(() => {
      // 重置所有
      console.log("%c BOX-Updated()--渲染完毕", "color:#fff; background-color: orange; border-radius: 2px; padding-right: 1px");
      this.locateApps();
    }, throttleTime);
  },
  methods: {
    locateApps() {
      let groups = this.$refs['group'];
      // console.info(groups.children)
      // 如果没有分组或者没有进入宫格模式，就直接结束本函数
      if (!groups || !this.gridMode) {
        return;
      }
      Array.from(groups).forEach((group, gid) => {
        let apps = group.children;
        Array.from(apps).forEach((app, aid) => {
          // 获取当前app的坐标和尺寸
          let appRect = app.getBoundingClientRect();
          let appGroups = this.box.appGroups;
          if (appGroups && appGroups[gid].length > 0) {
            this.$set(this.box.appGroups[gid][aid], "DOMRect", appRect);
            this.$set(this.box.appGroups[gid][aid], "suspendTime", 0);
          }
        });
        // TODO: 剩余空间 restSpace的计算，rest1 rest2
        this.$set(this.box.appGroups[gid], "restSpace", this.calcRestSpace());
      });
    },
    handleDragOver($event, groudIndex, appIndex) {
      $event.preventDefault();
    },
    handleDragStart($event, groudIndex, appIndex) {
      this.draggingApp.appIndex = appIndex;
      this.draggingApp.groupIndex = groudIndex;
      $event.stopPropagation();
      // 设置好拖拽鼠标指示的内容
      // $event.dataTransfer.effectAllowed = "link";
    },
    calcRestSpace() {
    },
  }
};
</script>
<style scoped>
.ndg-scroll-box {
  display: flex;
  flex-direction: row;
  height: 100%;
  position: relative;
  transition: 0.25s all ease-in-out;
  /* transform: translateX(0%); */
}

.ndg-app-group {
  width: 100%;
  height: 100%;
  transition: 0.5s all ease-in-out;
  /* z-index: -1; */
}

.ndg-app-container {
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
}

.ndg-app {
//border: 0.5px skyblue groove; box-sizing: border-box; flex-grow: 1;
  border-radius: 3%;
  cursor: pointer;
  position: relative;
  /* 限制宽度 */
  min-width: calc(calc(100% / 3));
  max-width: calc(calc(100% / 3));
  /* 限制高度 */
  min-height: calc(calc(100% / 3));
  max-height: calc(calc(100% / 3));
  animation: slideIn 1s forwards running ease-in-out alternate;
}

@keyframes slideIn {
  0% {
    transform: translateX(25%);
    opacity: 0.2;
  }

  100% {
    transform: translateX(0px);
    opacity: 1;
  }
}

.ndg-app-desc {
  font-size: 12px;
  line-height: 0px;
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

.ndg-app-shift-enter-active, .ndg-app-shift-leave-active {
  transition: all 0.5s ease-in-out;
}
.ndg-app-shift-enter, .ndg-app-shift-leave-to  {
  opacity: 0.5;
  transform: translateX(30px);
}

</style>
