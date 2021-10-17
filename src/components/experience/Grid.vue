<template>
  <div class="display-zone">
    <div id="container" @mousedown="mousedown">
      <!--      :style="{'place-self':item=='1'? 'end end':'stretch stretch'}"-->
      <div v-for="box in 16" :key="box" class="grid outer dragBox" :style="{'borderColor':randomColor()}" draggable="true" @dragstart="dragStart"
        @drop="dropApp" @dragover="allowDropIn">
        <div v-for="app in 9" :key="app" class="inner dragBox" :style="{'backgroundColor':randomColor()}" draggable="true">
          {{box}}-{{app}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  function getArrayIndex(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) {
        return i;
      }
    }
    return -1;
  }
  export default {
    data() {
      return {
        key: "value",
        innerDrag: false,
        outerDrag: false,
        draggedDOM: {},
        replacedDOM: {},
        relatedDOM: {}
      };
    },
    methods: {
      randomColor() {
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return "rgba(" + r + "," + g + "," + b + ",0.70)";
      },
      drag(ev) {
        ev.dataTransfer.setData("Text", ev.target.id);
      },
      dragStart(ev) {
        console.log("开始拖动", ev);
        console.log(ev.target);
      },
      mousedown(event) {
        console.log("鼠标下按", event.target);
        this.draggedDOM = event.target;
        console.log("鼠标按下的DOM:", this.draggedDOM);
        if (this.draggedDOM.getAttribute("class")) {
          let classes = this.draggedDOM.getAttribute("class").split(" ");
          console.log("被点击的DOM的Class属性:", classes);
          if (classes.includes("inner")) {
            this.innerDrag = true;
          }
          if (classes.includes("outer")) {
            this.outerDrag = true;
          }
          console.log(this.innerDrag ? "===内部驱动===" : "===外部驱动===");
          console.log(!this.outerDrag ? "===内部驱动===" : "===外部驱动===");
        }
      },
      dropApp(event) {
        console.log("dropApp 移动到Grid Container中", event.target);
        console.log(this.innerDrag ? "===内部驱动===" : "===外部驱动===");
        this.replacedDOM = event.target;
        console.log('event.target.className',event.target.className);
        console.log('event.dataTransfer.getData()',event.dataTransfer.getData('Text'));
        if ((event.target.className).includes("dragBox")) {
          if (this.innerDrag) {
            event.target.appendChild(document.getElementById(data));
          } else {
            console.log("被拖动", this.draggedDOM);
            console.log("被替换", this.replacedDOM, this.replacedDOM.nodeType);
            // draggedDOM replacedDOM 互换
            let appBox = document.getElementById("container");

            console.log(appBox.children[0]);
            let appBoxList = appBox.children;
            let i1 = getArrayIndex(appBoxList, this.draggedDOM);
            let i2 = getArrayIndex(appBoxList, this.replacedDOM);
            console.log("被拖动的index", i1);
            console.log("被替换的index", i2);
            // appBox.replaceChild(draggedDOM, appBoxList[i2])
            if (i1 < i2) {
              $(this.replacedDOM).after($(this.draggedDOM));
            } else {
              $(this.replacedDOM).before($(this.draggedDOM));
            }
            console.log(appBox.children);
          }
          this.innerDrag = false;
          this.outerDrag = false;
          event.preventDefault();
        }
      },
      allowDropIn(ev) {
        ev.preventDefault();
        // console.log('原生事件', ev)
      }
    }
  };
</script>

<style scoped>
.display-zone {
  /* height: ; */
  padding: 10px;
  width: 50%;
  margin: auto;
}

#container {
  border: 1px solid black;
  /* Grid布局 */
  display: grid;
  /* 容器里面的格子群的整体水平位置 start | end | center | stretch | space-around | space-between | space-evenly */
  justify-content: center;
  /* 容器里面的格子整体群的垂直位置 start | end | center | stretch | space-around | space-between | space-evenly */
  align-content: center;
  /* place-content属性是align-content属性和justify-content属性的合并简写形式。 */
  /* place-content: <align-content> <justify-content> */
  /* grid-template: ?; */
  /* 每一列 */
  grid-template-columns: repeat(4, 150px);
  /* 每一行 */
  grid-template-rows: repeat(4, 150px);
  /* 纵向方向的沟槽 */
  grid-column-gap: 5px;
  /* 横向方向的沟槽 */
  grid-row-gap: 5px;
  background-color: azure;

  width: 100%;
  /* 先列后行：对于 用不同规格的格子填充container的情况，dense尽可能紧密填满 */
  grid-auto-flow: row dense;
  height: 650px;
  margin: auto 0;
  /* 给每个区域命名 */
  /* grid-template-areas:
    "header header header header"
    "leftbar main main rightbar"
    "leftbar content content rightbar"
    "footer footer footer tips"; */
  /* 每个区域的起始网格线，会自动命名为区域名 ？-start，终止网格线自动命名为区域名 ？-end */
  grid-template-areas:
    "header header header header"
    "main main main main"
    "content content content content"
    "footer footer footer footer";
  /* 水平方向拉伸 */
  justify-items: stretch;
  /* 垂直方向拉伸 */
  align-items: stretch;
}

.grid {
  border: 2px solid;
  /* text-align: center; */
  cursor: url("/static/cursor/link.cur"), auto;
  /* 项目的位置是可以指定的，具体方法就是指定项目的四个边框，分别定位在哪根网格线，还可以指定为网格线的名字 */
  /* row column start end 组合 grid-column-start: 2;  grid-column-end: 4; */
  /* grid-area 属性指定项目放在哪一个区域 */
  /* justify-self 属性设置单元格内容的水平位置（左中右），跟justify-items属性的用法完全一致，但只作用于单个项目。*/
  /* align-self 属性设置单元格内容的垂直位置（上中下），跟align-items属性的用法完全一致，也是只作用于单个项目。 */
  justify-self: stretch;
  align-self: stretch;
  padding: 3px;
  overflow-x: auto;
}

.outer {
  /* 网格布局 */
  display: grid;
  /* 每一列 */
  grid-template-columns: repeat(3, 33.33%);
  /* 每一行 */
  grid-template-rows: repeat(3, 33.33%);
}
.inner {
  border: 1px solid black;
}
</style>
