<template>
  <div class="main">

    <template v-if="$route.path == '/mainEnter'">
      <!-- 解锁界面 -->
      <div v-if="!lockMode">
        <!--<router-link to="/nestedDragGrid">NDG</router-link>-->
        <unlocker @pass="gotoMainPage" @quitUnLockMode="quitUnLockMode"></unlocker>
      </div>
      <!-- 锁屏界面 -->
      <template v-else>
        <div class="locker">
          <div class="calender">
            <div class="time">
              <div>{{ hour }}</div>:
              <div>{{ min < 10 ? '0' + min : min }}</div>
              <!--:<span>{{ sec < 10 ? '0' + sec : sec }}</span>-->
            </div>
            <div class="date">{{ month }}月{{ day }}日 {{ week }}</div>
          </div>
        </div>
        <div class="tipslist">

        </div>
      </template>
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
import TimeMixin from "@/components/ndg/common/time";

export default {
  name: 'MainEnter',
  data() {
    return {
      lockMode: false,
    }
  },
  mixins: [TimeMixin],
  components: {Unlocker},
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
  width: 100%;
}

.locker {
  height: 100%;
  width: 100%;
  user-select: none;
  color: white;
}
.tipslist {

}

.calender {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.calender>.time {
  font-weight: 400;
  font-size: 5vmax;
}
.calender>.time > div:nth-child(1) {
  display: inline;
  margin-right: 10px;
}
.calender>.time > div:nth-child(2) {
  display: inline;
  margin-right: 10px;
}
.calender>.time > div:nth-child(3) {
  display: inline;
  margin-right: 10px;
}

.calender>.date {
  font-weight: 200;
  font-size: 3vmin;
}
</style>
<style scoped>

</style>
