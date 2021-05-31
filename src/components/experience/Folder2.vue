<template>
  <div class="box">
    <!-- 带上指令 v-dragging -->
    <div v-for="item in apps" v-dragging="{ item: item, list: apps , group: 'apps' }"
         class="color-item forbid0" :style="{'background': color}" :key="item.id">
      <div style="border: 1px groove orange">{{item.name}}</div>
    </div>
  </div>
</template>
<script>
  import {v4 as uuidv4} from "uuid";

  export default {
    name: "folder2",
    components: {},
    data() {
      return {
        appList: this.apps
      }
    },
    props: {
      apps: {
        type: Array,
        default: () => {
          return {}
        }
      },
      uuid: {
        type: String,
        default: () => {
          return uuidv4();
        }
      },
      color: {
        type: String,
        default: () => {
          return 'white';
        }
      }
    },
    watch: {
      'appsInfo': {
        immediate: true,
        deep: true,
        handler: function (val, oldVal) {
          this.appList = val;
        }
      }
    },
    methods: {
      //开始拖拽事件
      onStart() {
        this.drag = true;
        let arg = {
          uuid: this.uuid,
          list: this.list
        }
        this.$emit('sortWillChange', arg)
      },
      //拖拽结束事件
      onEnd() {
        this.drag = false;
        // console.log("this.list", this.list);
        // 顺序改变了
        let arg = {
          uuid: this.uuid,
          list: this.list
        }
        console.log('Folder组件发生改变', arg);
        // 触发事件 @sortChange
        this.$emit('sortChanged', arg)
      },
    }
  };
</script>
<style scoped>
  .item {
    margin: 1px;
    border: solid 1px #eee;
    background-color: #f1f1f1;
    width: 30%;
    height: 30%;
    display: inline-block;
    overflow: hidden;
    position: relative;
    margin: 1%;
  }

  .box {
    width: 100%;
    display: flex;
    border: solid 1px #eee;
    border-radius: 5px;
    margin: 2px;
    padding: 10px;
    display: inline-block;
  }
</style>
