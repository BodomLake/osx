
<template>
  <div class="dock-bar">
    <div class="usually">

    </div>
    <div class="running">

    </div>
  </div>
</template>
<script>
  // 程序坞
  export default {
    name: "dock-bar",
    data() {
      return {
        key: "value"
      };
    },
    model: {
      name: "dockApps",
      event: "dockChange"
    },
    methods: {
      name() {}
    },
    props: {
      dockApps: {
        type: Object,
        default: () => {
          return {};
        }
      }
    }
  };
</script>
<style scoped>
.dock-bar {
  position: fixed;
  bottom: 1vh;
  left: 50%;
  transform: translate(-50%, 0%);
  width: 90vw;
  height: 14vh;
  border-radius: 15px 15px 15px 15px;
  background-color: rgba(255, 255, 255, 0.5);
}
</style>