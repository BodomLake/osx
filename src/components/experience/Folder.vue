<template>
  <div class="box">
    <draggable v-model="list" group="apps" animation="300" dragClass="dragClass" ghostClass="ghostClass"
               chosenClass="chosenClass" @start="onStart" :move="moving"
               @end="onEnd" :id="uuid">
      <transition-group>
        <div class="item" v-for="item in list" :key="item.id">
          {{ item.name }}
        </div>
      </transition-group>
    </draggable>
  </div>
</template>
<script>
  import {v4 as uuidv4} from "uuid";

  export default {
    name: "folder",
    components: {},
    data() {
      return {
        list: this.arr
      }
    },
    props: {
      arr: {
        type: Array,
        default: () => {
          return new Array()
        }
      },
      uuid: {
        type: String,
        default: () => {
          return uuidv4();
        }
      }
    },
    watch: {
      'list': {
        immediate: true,
        deep: true,
        handler: function (val, oldVal) {
          this.list = val;
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
        // console.log('Folder组件内部-拖拽结束事件', arg);
        // 触发事件 @sortChange
        this.$emit('sortChanged', arg)
      },
      moving(evt, originalEvent) {
        this.$emit('sortChanging', evt)
        console.log('封装拖拽事件evt',evt);
        console.log('原生拖拽事件originalEvent',originalEvent);
      }
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
    padding: 3px;
    display: inline-block;
  }
</style>
