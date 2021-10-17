<template>
  <div class="main">
    <!-- 解锁界面 -->
    <template v-if="$route.path == '/mainEnter'">
      <div   v-if="lockMode">
        <!--<router-link to="/nestedDragGrid">NDG</router-link>-->
        <unlocker @pass="gotoMainPage" @quitUnLockMode="quitUnLockMode"></unlocker>
      </div>
    </template>
    <!-- 锁屏界面 -->
    <template v-else>
      <div class="locker">

      </div>
    </template>
    <keep-alive>
      <transition mode="out-in">
        <router-view/>
      </transition>
    </keep-alive>
  </div>
</template>
<script>
// 屏锁，上滑解锁，密码解锁
import Unlocker from "@/components/ndg/screenlocker/Unlocker";

export default {
  name: 'MainEnter',
  data(){
    return {
      lockMode: true,
    }
  },
  components: { Unlocker},
  methods: {
    gotoMainPage(judge) {
      if (judge) {
        this.$router.push({
          path: '/nestedDragGrid',
        });
      }
    },
    quitUnLockMode(msg) {
      this.lockMode = true;
    }
  }

}
</script>
<style scoped>
.main {
  background-image: url("../../../assets/iPad-Pro-2020-Wallpaper-2-YTECHB.jpg");
  height: 100%;
}
</style>
<style>

</style>
