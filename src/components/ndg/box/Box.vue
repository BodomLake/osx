<template>
  <div class="ndg-scroll-box" ref="group"
       :style="{'width': calcBoxWidth, 'transform': calcBoxOffsetX,'pointer-events': appliedInModal ? '' : 'none'}">
    <!-- 属于文件夹，默认九宫格模式，分割为9个一组，每一组作为一个大方格，含有9个或者以下的方格 -->
    <template v-for="(group, gid) in box.appGroups">
      <div class="ndg-app-group" :key="gid" v-if="gridMode" :data-gi="gid"
           :style="{'visibility': box.displayNum != gid ? 'hidden': ''}">
        <transition-group class="ndg-app-container" name="ndg-app-shift" :duration="switchDuration" tag="div">
          <template v-for="(app, aid) in group">
            <!-- 默认九个app一组 -->
            <div class="ndg-app" :key="app.id" :name="app.name" :data-group="gid" :id="app.id"
                 :data-gi="gid" :data-ai="aid" :data-di="modalIndex.deskIndex" :data-bi="modalIndex.boxIndex"
                 :draggable="enableDrag && appliedInModal" :style="{'pointer-events': appliedInModal ? '' : 'none'}"
                 :class="{'shakeAnime': enableDrag && gid && gid == box.displayNum}"
                 @dragover="appDragOver($event, gid, aid)"
                 @dragstart="appDragStart($event, gid, aid)"
                 @dragleave="appDragLeave($event, gid, aid)"
                 @dragenter="appDragEnter($event, gid, aid)"
                 @drop="appDrop($event, gid, aid)">
              <my-icon :className="app.name" v-if="app.name!==''"></my-icon>
              <div class="ndg-app-desc" v-if="showAppName">{{ app.name }}</div>
            </div>
          </template>
          <div :name="rectIdArr1[gid]" :key="rectIdArr1[gid]"
               @dragover="restZoneDragOver($event, gid)"
               @drop="restZoneDrop($event, gid)"
               style="max-height: 33.33%; min-height: 33.33%"
               :style="{'width': domRectArr1[gid], 'pointer-events': appliedInModal ? '' : 'none'}">
          </div>
          <div :name="rectIdArr2[gid]" :key="rectIdArr2[gid]"
               @dragover="restZoneDragOver($event, gid)"
               @drop="restZoneDrop($event, gid)"
               style="width: 100%; height: auto"
               :style="{'height': domRectArr2[gid], 'pointer-events': appliedInModal ? '' : 'none'}">
          </div>
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
import MyIcon from "../MyIcon.vue";
import {v4 as uuidv4} from "uuid";
import {Timer} from "@/components/ndg/timer";
import {APP, swapEle} from "@/components/ndg/common";
import mixin from './mixin'

export default {
  name: "box",
  beforeCreate() {
  },
  components: {
    MyIcon: MyIcon
  },
  mixins: [mixin],
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
      // 正在移动app
      movingApp: false,
      groupShifting: false,
    };
  },
  computed: {
    appGroups() {
      return this.box.appGroups;
    },
    // 宫格模式 如果被覆盖就一定要开启，如果没有覆盖的情况，就要根据app的数量判断
    gridMode() {
      if (this.box.covered || this.appliedInModal) {
        return true;
      } else {
        let appCount = this.appGroups.flat(2).filter(app => {
          return app.name != "";
        }).length;
        return appCount > 1;
      }
    },
    // 计算盒子水平偏移量
    calcBoxOffsetX(arr, displayNum) {
      if (this.gridMode == false) {
        return 'translateX(0%)'
      }
      let len = this.appGroups.length;
      return `translateX(-${this.box.displayNum * (100 / len)}%)`;
    },
    // 计算盒子宽度
    calcBoxWidth() {
      let arr = this.appGroups;
      if (this.gridMode == false) {
        return '100%'
      }
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
      this.appGroups.forEach((group, did) => {
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
      this.appGroups.forEach((group, did) => {
        let boxNum = group.length;
        let height = (row - Math.ceil(boxNum / col)) / row * 100 + '%'
        arr.push(height)
      })
      return arr;
    },
    rectIdArr1() {
      return this.appGroups.map(g => {
        return uuidv4()
      })
    },
    rectIdArr2() {
      return this.appGroups.map(g => {
        return uuidv4()
      })
    },
    // 被拖拽的APP
    draggingApp: {
      cache: false,
      get() {
        let gid = this.$store.state.draggingIndex.groupIndex;
        let aid = this.$store.state.draggingIndex.appIndex;
        return this.appGroups[gid][aid]
      }
    },
    // 目标的APP
    targetApp: {
      cache: false,
      get() {
        let gid = this.$store.state.targetIndex.groupIndex
        let aid = this.$store.state.targetIndex.appIndex
        return this.appGroups[gid][aid]
      }
    },
  },
  props: {
    box: {
      type: Object,
      default: () => {
        return {}
      }
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
      default: 250
    },
    // 被当成Modal选中的情况
    appliedInModal: {
      type: Boolean,
      default: false,
    },
    modalIndex: {
      type: Object,
      required: false,
      default: () => {
        return {
          deskIndex: 0,
          boxIndex: 0,
          groupIndex: 0,
          appIndex: 0,
        }
      }
    }
  },
  watch: {
    box: {
      handler: function (newBOX, oldBOX) {
        this.setApps();
      },
      immediate: false,
      depp: true
    }
  },
  mounted() {
    this.setApps();
  },
  updated() {
    // 节流 300ms
    let throttleTime = 300;
    if (Date.now() - this.updatedTimer < throttleTime) {
      return;
    }
    this.updatedTimer = Date.now();
    window.setTimeout(() => {
      // 重置所有
      // console.log("%c BOX-Updated()--渲染完毕", "color:#fff; background-color: orange; border-radius: 2px; padding-right: 1px");
      this.setApps();
    }, throttleTime);
  },
  methods: {
    setApps() {
      let groups = this.$refs['group'];
      // 如果没有分组或者没有进入宫格模式，就直接结束本函数
      if (!groups || !this.gridMode) {
        return;
      }
      Array.from(groups.children).forEach((group, gid) => {
        let apps = group.children;
        Array.from(apps[0].children).forEach((app, aid) => {
          if (app.classList.contains(APP) && this.appGroups[gid] && this.appGroups[gid].length > 0) {
            // console.log(this.appGroups[gid][aid])
            if (this.appGroups[gid][aid]) {
              this.$set(this.appGroups[gid][aid], "suspendTimer", new Timer());
            }
          }
        });
      });
    },
    shiftApp(targetGI, targetAI) {
      if (this.movingApp || this.groupShifting) {
        console.info('当前正在移动App，或者切换Group')
        return;
      }
      let appIndex = this.$store.state.draggingIndex.appIndex;
      let groupIndex = this.$store.state.draggingIndex.groupIndex;
      if (groupIndex == targetGI && appIndex == targetAI) {
        console.warn('不可以挤压自己，置换自己')
        this.movingApp = false;
        return;
      }
      let reset = () => {
        // 置换后，要修改draggingIndex的数据
        this.$store.commit('setDraggingIndex', {
          groupIndex: targetGI,
          appIndex: targetAI,
        })
        console.log('setDraggingIndex', 'shiftApp')
        this.setApps();
        // 移动结束了
        setTimeout(() => {
          console.info('movingApp已经重置为false')
          this.movingApp = false;
        }, this.switchDuration)
      }
      // 开始移动App
      this.movingApp = true;
      if (targetGI == this.$store.state.draggingIndex.groupIndex) {
        // 移动方向 true为向右下移动，也就是下标增大；反之就是 下标减小，向左上方移动
        let moveToHigher = appIndex < targetAI && appIndex != targetAI;
        let moveToLower = appIndex > targetAI && appIndex != targetAI;
        // 目标组
        let targetGroup = this.appGroups[targetGI];
        console.log('目标组', targetGroup, targetGI, targetAI)
        // 从左到右
        if (moveToHigher) {
          for (let i = appIndex; i < targetAI; i++) {
            targetGroup = swapEle(targetGroup, i, i + 1);
          }
          reset();
        } else if (moveToLower) {
          for (let j = appIndex; j > targetAI; j--) {
            targetGroup = swapEle(targetGroup, j, j - 1);
          }
          reset();
        }
      } else {
        let draggedAPP = this.appGroups[groupIndex].splice(appIndex, 1)[0]
        this.appGroups[targetGI].splice(targetAI, 0, draggedAPP);
        reset();
      }
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
//border: 0.5px skyblue groove; box-sizing: border-box; flex-grow: 1; border-radius: 3%; cursor: pointer; position: relative;
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

.ndg-app-shift-move > .ndg-app {
  border: 1px solid white;
  transition: transform 0.5s;
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

.ndg-app-shift-enter, .ndg-app-shift-leave-to {
  opacity: 0.5;
  transform: translateX(30px);
}

</style>
