<template>
  <div class="drag">
    <!--使用draggable组件-->
    <!--    <draggable v-model="arr" ghostClass="ghostClass" chosenClass="chosenClass" filter=".forbid" :move="moving">
          <div class="appBox" v-for="item in arr">
            <folder2 :apps="item.apps" :color="item.color"></folder2>
          </div>
        </draggable>-->
    <button @click="nextWeek">NextWeek</button>
    <div style="width: 700px; height: 200px;margin: 0px auto;color: white">
      <Week :display-date="displayDate" ref="week"></Week>
    </div>

  </div>
</template>
<script>
let today = new Date()
// import draggable from "vuedraggable";
import Folder2 from "./Folder2";
import {swapEle} from "@/components/ndg/common/common";
import Week from "@/components/ndg/topbar/time/display/Week";

export default {
  name: "draggableDND",
  components: {
    Week,
    Folder2
  },
  data() {
    let arr = new Array();
    let arr1 = [
      {id: 1, name: "www.iteye.com"},
      {id: 2, name: "www.jd.com"},
      {id: 3, name: "www.baidu.com"},
      {id: 4, name: "www.itying.com"},
      {id: 5, name: "www.52pj.com"},
      {id: 6, name: "www.fanyi.com"},
      {id: 7, name: "www.github.com"},
      {id: 8, name: "www.gitee.com"},
      {id: 9, name: "www.tianya.com"}
    ];
    let arr2 = [
      {id: 10, name: "www.google.com"},
      {id: 11, name: "www.msn.com"},
      {id: 12, name: "www.ebay.com"},
      {id: 13, name: "www.e2e.com"},
      {id: 14, name: "www.p2p.com"},
      {id: 15, name: "www.art.com"},
      {id: 16, name: "www.zhihu.com"},
      {id: 17, name: "www.v2x.com"},
      {id: 18, name: "www.jr2.com"}
    ];
    let arr3 = [
      {id: 19, name: "www.qq.com"},
      {id: 20, name: "www.lol.com"},
      {id: 21, name: "www.mail.com"},
      {id: 22, name: "www.163.com"},
      {id: 23, name: "www.996.com"},
      {id: 24, name: "www.icu.com"},
      {id: 25, name: "www.pdd.com"},
      {id: 26, name: "www.isp.com"},
      {id: 27, name: "www.gkd.com"}
    ];
    let arr4 = [
      {id: 28, name: "www.tencent.com"},
      {id: 29, name: "www.iqq.com"},
      {id: 30, name: "www.qzone.com"},
      {id: 31, name: "www.135.com"},
      {id: 32, name: "www.110.com"},
      {id: 33, name: "www.git.com"},
      {id: 34, name: "www.3x.com"},
      {id: 35, name: "www.xart.com"},
      {id: 36, name: "www.good.com"}
    ];
    return {
      arr: [
        {
          color: "Aquamarine",
          apps: arr1
        },
        {
          color: "Hotpink",
          apps: arr2
        },
        {
          color: "Gold",
          apps: arr3
        },
        {
          color: "Crimson",
          apps: arr4
        },
        // {
        //   color: "Blueviolet"
        // },
        // {
        //   color: "Lightblue"
        // },
        // {
        //   color: "Cornflowerblue"
        // },
        // {
        //   color: "Skyblue"
        // },
        // {
        //   color: "Burlywood"
        // }
      ],
      // 内部被拖拽！
      innerDragEvent: false,
      // items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      items: [],
      displayDate: {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        date: today.getDate(),
        day: today.getDay(),
        weekNo: 0,
      },
    }
  },
  mounted() {
    this.items = Array.apply(null, {length: 7}).map((ele, ei) => {
      return {days: [Math.random(), Math.random(), Math.random()], order: ei}
    })
  },
  methods: {
    //开始拖拽事件
    onStart() {
      this.drag = true;
    },
    //拖拽结束事件
    onEnd() {
      this.drag = false;
      console.log("this.arr1", this.arr[0]);
      console.log("this.arr2", this.arr[1]);
      console.log("this.arr3", this.arr[2]);
    },
    //开始拖拽事件
    onStart0(evt) {
      this.drag = true;
    },
    //拖拽结束事件
    onEnd0(evt) {
      this.drag = false;
      console.log("this.arr", this.arr);
      console.log(evt);
    },
    moving(evt, originalEvent) {
      console.log('evt', evt);
      console.log('originalEvent', originalEvent);
      // 被拖拽的
      // console.log('被拖拽的 之前的index',evt.draggedContext.index);
      // console.log('被拖拽的 元素Element',evt.draggedContext.element);
      // console.log('被拖拽的 下一个index',evt.draggedContext.futureIndex);
      console.log('被拖拽的', evt.draggedContext);
      // 被挤走的
      // console.log('被挤走的 开始的index',evt.relatedContext.index);
      // console.log('被挤走的 元素Element',evt.relatedContext.element);
      // console.log('被挤走的 下一个index',evt.relatedContext.futureIndex);
      console.log('被挤走的', evt.relatedContext);
      // console.log(evt.relatedContext.list);
      // console.log(evt.relatedContext.component);
      // return !(evt.draggedContext.element == undefined)
    },
    shuffle: function () {
      /*      let i1 = Math.floor(Math.random() * 10);
            let i2 = Math.floor(Math.random() * 10);
            while (i1 == i2) {
              i2 = Math.floor(Math.random() * 10)
            }
            this.items = swapEle(this.items, i1, i2)*/
      let temp = this.items[1]
      this.$set(this.items, 1, this.items[0])
      this.$set(this.items, 0, temp)
      // this.items = swapEle(this.items, 1, 0)
    },
    nextWeek() {
      this.$refs['week'].nextWeek()
    }
  }
};
</script>

<style scoped>
.drag {
  height: 100%;
  width: 100%;
}

/*定义要拖拽元素的样式*/
.ghostClass {
  background-color: blue !important;
}

.chosenClass {
  background-color: red !important;
  opacity: 1 !important;
}

.dragClass {
  background-color: blueviolet !important;
  opacity: 1 !important;
  box-shadow: none !important;
  outline: none !important;
  background-image: none !important;
}

.folerList {
  margin: 10px;
  height: 100%;
}

.title {
  padding: 6px 12px;
}

.col {
  width: 20%;
  display: flex;
  border: solid 1px #eee;
  border-radius: 5px;
  float: left;
  margin: 10px;
  padding: 10px;
}

.item {
  margin: 1px;
  border: solid 1px #eee;
  background-color: #f1f1f1;
  width: 30%;
  height: 30%;
  display: inline-block;
  overflow: hidden;
}

.item:hover {
  background-color: #fdfdfd;
  cursor: url("/static/cursor/link.cur"), auto;
}

.item + .item {
  border-top: none;
}

.grid-box {
  display: flex;
  align-content: center;
}

.appBox {
  border: 1px groove;
  margin: 5px;
}
</style>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}

.div {
  position: absolute;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  min-width: 200%;
  max-width: 200%;
  width: 200%;
  overflow-x: hidden;
  overflow-y: hidden;
  left: -50%;
}

#flip-list-demo {
  width: 50%;
  height: 200px;
  box-sizing: border-box;
  color: black;
  height: fit-content;
  /*  margin: 0px auto;*/
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
}

.box {
  min-width: 10%;
  max-width: 10%;
  max-height: 100%;
  min-height: 100%;
  position: relative;
}
</style>
