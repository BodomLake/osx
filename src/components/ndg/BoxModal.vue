<template>
  <div class="ndg-modal hor-vet-center" v-if="showFlag" >
    <div class="ndg-modal-header">
      <div class="ndg-modal-desc" v-if="editable" style="animation:none" @click="keepModal">
        {{name}}
        <my-icon className="delete" v-if="editable"></my-icon>
      </div>
      <!-- <slot name="header"></slot> -->
    </div>
    <div class="ndg-modal-content" @click="keepModal">
      <box v-model="apps" :multipleSize="13" :showAppName='true'></box>
      <indicator></indicator>
      <!-- <slot name="content"></slot> -->
    </div>
    <div class="ndg-modal-footer" >
      <!-- <slot name="footer"></slot> -->
    </div>
  </div>
</template>

<script>
  import MyIcon from "./MyIcon.vue";
  import Box from "./Box.vue";
  // 右键点击出现的模态框
  import Indicator from "./Indicator.vue";
  export default {
    name: "box-modal",
    components: {
      indicator: Indicator,
      MyIcon: MyIcon,
      Box: Box
    },
    data() {
      return {
        editable: true,
        currentAppGroup: 0
      };
    },
    model: {
      prop: "apps",
      event: "changeApp"
    },
    props: {
      apps: {
        type: Array,
        default: () => {
          return [];
        }
      },
      showFlag: {
        type: Boolean,
        default: () => {
          return false;
        }
      },
      name: {
        type: String,
        default: () => {
          return "";
        }
      }
    },
    methods: {
      changeModalShow(showFlag) {
        debugger;
        this.showFlag = showFlag;
      },
      keepModal($event){
        // 防止点击模态框的时候响应全局click关闭modal
        $event.stopPropagation();
        // console.log($event)
      },
    },
    beforeCreate() {},
    mounted() {}
  };
</script>
<!-- 模态框css样式 -->
<style scoped>
.ndg-modal {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-items: auto;
  /* 以下css属性都要被动态class重置 */
  position: fixed;
  height: 100vmin;
  z-index: 10;
}
.ndg-modal-header {
  flex-grow: 1;
  position: relative;
}
.ndg-modal-content {
  min-width: 60vmin;
  min-height: 60vmin;
  background-color: rgba(255, 255, 255, 0.45);
  border-radius: 10%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
.ndg-modal-content > :nth-child(1) {
  flex-grow: 8;
  background-color: rgba(255, 255, 255, 0.45);
}
.ndg-modal-content > :nth-child(2) {
  flex-grow: 1;
}
.ndg-modal-footer {
  position: relative;
  flex-grow: 1;
}
.ndg-modal-desc {
  position: absolute;
  font-size: 5vmin;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 5vmin;
  color: whitesmoke;
  font-weight: 200;
  align-self: center;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 100%;
  height: 30%;
  /* border: 1px solid brown; */
  border-radius: 3%;
  background-color: rgba(0, 0, 0, 0.35);
}
.hor-vet-center {
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
}
</style>