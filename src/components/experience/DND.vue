<template>
  <div class="color-list">
    <div v-for="item in arr" v-dragging="{ item: item, list: arr, group: 'color',handle: '.outer' }"
         class="color-item draggable" :style="{'background':item.color}" :key="item.color" :id="item.id" :draggable="!innerDragEvent"
         @mousedown="pickTheEle">
      <!--<span>{{color.text}}</span>-->
      <folder :arr.sync="item.apps" @sortChanged="sortChanged" @sortWillChange="sortWillChange"
              @sortChanging="sortChanging" class="undraggable"></folder>
    </div>
  </div>
</template>

<script>
  import Folder from "./Folder";

  export default {
    name: "DND",
    components: {Folder},
    data() {
      let arr = new Array();
      let arr1 = [
        {id: 1, name: "www.iteye.com"},
        {id: 2, name: "www.jd.com"},
        {id: 3, name: "www.baidu.com"},
        {id: 4, name: "www.itying.com"},
        {id: 5, name: "www.51pj.com"},
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
            apps: arr1,
            id: 'outer1'
          },
          {
            color: "Hotpink",
            apps: arr2,
            id: 'outer2'
          },
          {
            color: "Gold",
            apps: arr3,
            id: 'outer3'
          },
          {
            color: "Crimson",
            apps: arr4,
            id: 'outer4'
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
        innerDragEvent: true,
      }
    },
    methods: {
      sortChanged(arg) {
        // console.log('DND接收到：内部已经发生了改变', arg);
        // this.innerDragEvent = true;
      },
      sortWillChange(arg) {
        // console.log('DND接收到：内部顺序改变', arg);
        // this.innerDragEvent = true;
      },
      sortChanging(arg) {
        // console.log('DND接收到：正在调整顺序', arg);
        // this.innerDragEvent = true;
      },
      pickTheEle(event) {
        let clickDOM = event.target;
        console.log('鼠标按下的DOM:', clickDOM);
        let classes = clickDOM.getAttribute('class').split(' ')
        console.log('被点击的DOM的Class属性:', classes);
        console.log(classes);
        // 如果没有这个内部的样式，那么这次属于外部拖拽
        if (!classes.includes("item")) {
          console.log('外部拖拽');
          this.innerDragEvent = false;
        } else {
          console.log('内部拖拽');
          this.innerDragEvent = true;
        }
      }
    },
    created() {

    },
    mounted() {

      this.$dragging.$on('dragged', ({value}) => {
        console.log(value)
        console.log(this.innerDragEvent)
        let pass = !this.innerDragEvent;
        console.log('允许外部大块拖拽?', pass)
        console.log('内部拖拽事件？', this.innerDragEvent)
      })

      this.$dragging.$on('dragend', ({value}) => {
        console.log('dragend', value)
        return !this.innerDragEvent;
      })

    }
  }
</script>

<style scoped>
  .color-item {
    /*display: inline-block;*/
    width: 50%;
    overflow: hidden;
    padding: 10px;
  }

  .color-list {
    height: 100%;
  }
</style>
