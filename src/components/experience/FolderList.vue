<template>
  <div class="drag">
    <!--使用vuedraggable组件做外层 DND做里层-->
    <div class="folerList">

      <draggable v-model="arr" animation="300" :tag="'folder'">
        <folder :arr="arr[0]"></folder>
        <folder :arr="arr[1]"></folder>
        <folder :arr="arr[2]"></folder>
        <folder :arr="arr[3]"></folder>
      </draggable>

    </div>
  </div>
</template>
<script>
  // import draggable from "vuedraggable";
  // import Folder from "./Folder";
  const Folder = () => import("./Folder")
  export default {
    name: "folderList",
    components: {
      // 'draggable1': draggable,
      'folder': Folder
    },
    data() {
      let arr = new Array();
      let arr1 = [
        { id: 1, name: "www.iteye.com" },
        { id: 2, name: "www.jd.com" },
        { id: 3, name: "www.baidu.com" },
        { id: 4, name: "www.itying.com" },
        { id: 5, name: "www.51pj.com" },
        { id: 6, name: "www.fanyi.com" },
        { id: 7, name: "www.github.com" },
        { id: 8, name: "www.gitee.com" },
        { id: 9, name: "www.tianya.com" }
      ];
      let arr2 = [
        { id: 10, name: "www.google.com" },
        { id: 11, name: "www.msn.com" },
        { id: 12, name: "www.ebay.com" },
        { id: 13, name: "www.e2e.com" },
        { id: 14, name: "www.p2p.com" },
        { id: 15, name: "www.art.com" },
        { id: 16, name: "www.zhihu.com" },
        { id: 17, name: "www.v2x.com" },
        { id: 18, name: "www.jr2.com" }
      ];
      let arr3 = [
        { id: 19, name: "www.qq.com" },
        { id: 20, name: "www.lol.com" },
        { id: 21, name: "www.mail.com" },
        { id: 22, name: "www.163.com" },
        { id: 23, name: "www.996.com" },
        { id: 24, name: "www.icu.com" },
        { id: 25, name: "www.pdd.com" },
        { id: 26, name: "www.isp.com" },
        { id: 27, name: "www.gkd.com" }
      ];
      let arr4 = [
        { id: 28, name: "www.tencent.com" },
        { id: 29, name: "www.iqq.com" },
        { id: 30, name: "www.qzone.com" },
        { id: 31, name: "www.135.com" },
        { id: 32, name: "www.110.com" },
        { id: 33, name: "www.git.com" },
        { id: 34, name: "www.3x.com" },
        { id: 35, name: "www.xart.com" },
        { id: 36, name: "www.good.com" }
      ];
      let arr5 = [];
      arr.push(arr1);
      arr.push(arr2);
      arr.push(arr3);
      arr.push(arr4);
      arr.push(arr5);
      return {
        drag: false,
        //定义要被拖拽对象的数组
        arr: arr
      };
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
      }
    }
  };
</script>
<style scoped>
.drag {
  position: absolute;
  left: 30%;
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
  padding: 3px;
}
/* .col + .col {
  margin-left: 10px;
} */

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
  cursor: pointer;
}
.item + .item {
  border-top: none;
}

.grid-box {
  display: flex;
  align-content: center;
}
</style>
