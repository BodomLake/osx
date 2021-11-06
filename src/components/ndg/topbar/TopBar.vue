<template>
  <div class="top-bar">
    <Time></Time>
  </div>
</template>

<script>
import Time from "@/components/ndg/topbar/Time";

export default {
  name: "TopBar",
  components: {
    Time: Time
  }
}
</script>

<style scoped>
.top-bar {
  height: 4vmin;
  width: 100%;
  /*border-bottom: 0.5px darkgrey groove;*/
  background-color: rgba(192, 192, 192, 0.5);
  box-shadow: 0px -1px 1px 0.5px rgba(62, 10, 10, 0.2) inset;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
}
</style>
