<template>
  <div class="ndg-scroll-box" :style="{'width': calcBoxWidth(splitArr(apps)),
                   'transform': calcBoxOffsetX(splitArr(apps), currentAppGroup)}">
    <!-- 属于文件夹，九宫格模式，默认分割为9个一组，每一组作为一个大方格，含有9个或者以下的方格 -->
    <template v-for="(group, gid) in splitArr(apps)">
      <div class="ndg-app-group" :key="gid" v-if="apps.length > 1">
        <!-- 九个app -->
        <template v-for="(app, aid) in group">
          <!-- @dragstart="appGroupDragStart($event)"  @drop="innerOnDrop"  @dragover="innerDragover" :draggable="isDragging"  @drag="appOnDrag" -->
          <div class="ndg-app" :key="app.id" :name="app.name" :data-group="gid" :data-order="9*gid+aid" :id="app.id">
            <my-icon :className="app.name" v-if="app.name!==''" :size="multipleSize"></my-icon>
            <div class="ndg-app-desc" v-if="showAppName">
              {{app.name}}
            </div>
          </div>

        </template>
      </div>
    </template>
    <!-- 如果不属于文件夹，也是innerBox长度为0 -->
    <template v-if="apps.length == 1">
      <my-icon :className="apps[0].name" :size="singleSize"></my-icon>
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
      prop: "apps",
      event: "changeApp"
    },
    data() {
      return {};
    },
    props: {
      apps: {
        type: Array,
        default: () => {
          return [];
        }
      },
      // 每组app数量上限
      groupAppLimit: {
        type: Number,
        default: () => {
          return 9;
        }
      },
      // 单个app时候的尺寸大小
      singleSize: {
        type: Number,
        default: () => {
          return 17;
        }
      },
      // 多个app时候的尺寸大小
      multipleSize: {
        type: Number,
        default: () => {
          return 5;
        }
      },
      currentAppGroup: {
        type: Number,
        default: () => {
          return 0;
        }
      },
      showAppName: {
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
        // debugger
        return `translateX(-${displayNo * (100 / len)}%)`;
      },
      splitArr(arr) {
        //arr是你要分割的数组，num是以几个为一组
        let newArr = []; //首先创建一个新的空数组。用来存放分割好的数组
        for (let i = 0; i < arr.length; ) {
          //注意：这里与for循环不太一样的是，没有i++
          newArr.push(arr.slice(i, (i += this.groupAppLimit)));
        }
        return newArr;
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
  /* border: 1px solid red; */
  /* 限制宽度 */
  min-width: calc(calc(100% / 3));
  max-width: calc(calc(100% / 3));
  /* 限制高度 */
  min-height: calc(calc(100% / 3));
  max-height: calc(calc(100% / 3));
}
.ndg-app-desc {
  position: absolute;
  bottom: 0%;
  left: 50%;
  transform: translateX(-50%);
}
</style>