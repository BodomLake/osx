<template>
  <div class="ndg-scroll-box" :style="{'width': calcBoxWidth(appGroups),
                   'transform': calcBoxOffsetX(appGroups, box.displayNo)}">
    <!-- 属于文件夹，默认九宫格模式，分割为9个一组，每一组作为一个大方格，含有9个或者以下的方格 -->
    <template v-for="(group, gid) in appGroups">
      <div class="ndg-app-group" :key="gid" v-if="gridMode" :style="{'visibility': box.displayNo != gid ? 'hidden': ''}">
        <!-- 九个app -->
        <template v-for="(app, aid) in group">
          <div class="ndg-app" :key="app.id" :name="app.name" :data-group="gid" :data-order="9*gid+aid" :id="app.id" :draggable="draggable">
            <my-icon :className="app.name" v-if="app.name!==''" :size="multipleSize"></my-icon>
            <div class="ndg-app-desc" v-if="showAppName">
              {{app.name}}
            </div>
          </div>
        </template>
      </div>
    </template>
    <!-- 不开启宫格模式 -->
    <template v-if="!gridMode">
      <my-icon :className="box.apps[0].name" :size="singleSize"></my-icon>
    </template>
  </div>
</template>
<script>
  // 存放app的盒子
  import MyIcon from "./MyIcon.vue";
  export default {
    name: "box",
    beforeCreate() {},
    mounted() {},
    components: {
      MyIcon: MyIcon
    },
    model: {
      prop: "box",
      event: "changeBox"
    },
    data() {
      return {};
    },
    computed: {
      appGroups() {
        let groups = [];
        for (let i = 0; i < this.box.apps.length; ) {
          groups.push(this.box.apps.slice(i, (i += this.box.groupAppLimit)));
        }
        return groups;
      },
      gridMode() {
        return this.box.apps.length > 1;
      }
    },
    props: {
      box: {
        type: Object,
        default: () => {
          return {};
        }
      },
      // 单个app时候的尺寸大小
      singleSize: {
        type: Number,
        default: () => {
          return 10;
        }
      },
      // 多个app时候的尺寸大小
      multipleSize: {
        type: Number,
        default: () => {
          return 1;
        }
      },
      showAppName: {
        type: Boolean,
        default: false
      },
      draggable: {
        type: Boolean,
        default: false
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
      splitArr(arr) {
        let groups = [];
        for (let i = 0; i < arr.length; ) {
          groups.push(arr.slice(i, (i += this.box.groupAppLimit)));
        }
        return groups;
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
  font-size: 8px;
  position: absolute;
  bottom: 0%;
  left: 50%;
  transform: translateX(-50%);
}
</style>