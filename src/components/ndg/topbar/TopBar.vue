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
  background-color: silver;
  opacity: 0.7;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 10;
}
</style>
