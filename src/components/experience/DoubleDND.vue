<template>
  <div>
    <div v-for="item in arr" v-dragging="{ item: item, list: arr, group: 'outer',handle: '.outerDrag' }"
         class="color-item draggable" :style="{'background':item.color}" :key="item.color">
      <div v-for="app in item.apps" :key="app.id" v-dragging="{ item:app, list: item.apps, group: 'outer', handle: 'innerDrag'}"
           class="inner-item">
        <span>{{app.name}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "DoubleDND",
    components: {}, data() {
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
        ],
        // 内部被拖拽！
        innerDragEvent: false
      }
    },
    mounted() {
      this.$dragging.$on('dragged', ({value}) => {
        console.log(value)
        // console.log(value.list)
        console.log(value.otherData)
        // let pass = !this.innerDragEvent;
        // console.log('允许外部大块拖拽?', pass, this.innerDragEvent)
        // this.innerDragEvent = false;
        return true;
      })

      this.$dragging.$on('dragend', () => {

      })
    }

  }
</script>

<style scoped>
  .color-item {
    padding: 20px;
    margin: 10px;
  }

  .inner-item {
    border: 1px black groove;
  }
</style>
