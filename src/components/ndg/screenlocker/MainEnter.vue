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
              <div>{{ hour }}</div>
              :
              <div>{{ min < 10 ? '0' + min : min }}</div>
              <!--:<span>{{ sec < 10 ? '0' + sec : sec }}</span>-->
            </div>
            <div class="date">{{ month }}月{{ day }}日 {{ week }}</div>
          </div>
        </div>
        <div class="tipsList-zone">
          <TipsList @enterApp="enterApp"></TipsList>
        </div>
        <div class="handler">

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
import TipsList from "@/components/ndg/screenlocker/TipsList";

export default {
  name: 'MainEnter',
  data() {
    return {
      lockMode: true,
    }
  },
  mounted() {

  },
  mixins: [TimeMixin],
  components: {Unlocker, TipsList},
  methods: {
    gotoMainPage(judge) {
      if (judge) {
        this.$router.push({
          path: '/nestedDragGrid',
        });
      }
      this.lockMode = true;
    },
    quitUnLockMode(msg) {
      this.lockMode = true;
    },
    enterApp(app) {
      console.log(app)
      // 进入解锁界面
      this.lockMode = false;
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

.tipsList-zone {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -40%);
  width: 100%;
  height: 66vh;
}

.handler {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 1vh;
  height: 1vw;
  width: 30vw;
  background-color: white;
  border-radius: 10px 10px 10px 10px;
  transition: all 500ms ease-in-out;
}

.calender {
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.calender > .time {
  font-weight: 400;
  font-size: 5vw;
}

.calender > .time > div:nth-child(1) {
  display: inline;
  margin-right: 1vw;
}

.calender > .time > div:nth-child(2) {
  display: inline;
}

.calender > .time > div:nth-child(3) {
  display: inline;
}

.calender > .date {
  font-weight: 200;
  font-size: 2vmin;
}
</style>
<style scoped>
@media screen and (orientation: portrait) {
  .handler {
    width: 40vmin;
  }

}
</style>
