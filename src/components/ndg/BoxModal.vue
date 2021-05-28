<template>
  <div class="ndg-folder-modal">
    <div class="ngd-header">
      <slot name="header"></slot>
    </div>
    <div class="content">
      <slot name="content"></slot>
    </div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
// 右键点击出现的模态框
  export default {
    name: "box-modal",
    data() {
      return {
        key: value
      };
    },
    methods: {
      name() {}
    },
    beforeCreate() {},
    mounted() {}
  };
</script>
<style scoped>
/* 弹窗 */
.ndg-folder-modal {
  display: none; /* 默认隐藏 */
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
  -webkit-animation-name: fadeIn;
  -webkit-animation-duration: 0.4s;
  animation-name: fadeIn;
  animation-duration: 0.4s;
}

/* 弹窗内容 */
.ndg-content {
  position: fixed;
  bottom: 0;
  background-color: #fefefe;
  width: 100%;
  -webkit-animation-name: slideIn;
  -webkit-animation-duration: 0.4s;
  animation-name: slideIn;
  animation-duration: 0.4s;
}
</style>