<template>
  <div class="dock-bar">
    <div class="dock-usually">
      <template v-for="app in dockApps.usually">
        <div class="ndg-app" style="min-width: 16.66%; max-width: 16.66%;">
          <my-icon :className="app.name" v-if="app.name!==''"></my-icon>
        </div>
      </template>
    </div>
    <div class="dock-running">
      <template v-for="app in dockApps.running">
        <div class="ndg-app" style="min-width: 33.33%; max-width: 33.33%;">
          <my-icon :className="app.name" v-if="app.name!==''"></my-icon>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
// 程序坞
import MyIcon from "@/components/ndg/MyIcon";

export default {
  name: "dock-bar",
  data() {
    return {
      key: "value"
    };
  },
  components: {
    MyIcon: MyIcon
  },
  model: {
    prop: "dockApps",
    event: "dockAppsChange"
  },
  methods: {
    name() {
    }
  },
  props: {
    dockApps: {
      type: Object,
      require: true,
      default: () => {
        return {
          usually: [],
          running: []
        };
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
  background-color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: row;
}

.dock-usually {
  flex-grow: 2;
  height: 100%;
  display: flex;
  padding-left: 1%;
  padding-right: 0%;
}

.dock-running {
  flex-grow: 1;
  height: 100%;
  display: flex;
  padding-left: 0%;
  padding-right: 1%;
}

.ndg-app {
  animation: slideIn 1s forwards running ease-in-out alternate;
  padding: 0%;
}

@keyframes slideIn {
  0% {
    transform: translateX(25%);
    opacity: 0.2;
  }
  100% {
    transform: translateX(0px);
    opacity: 1;
  }
}

.dock-running::before {
  content: '';
  border-left: 1px #f1f1f1 solid;
  width: 1px;
  height: 80%;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

.ndg-app:hover {
  transform: scale(1.1);
}

</style>
<style scoped>
@media screen and (orientation: portrait) {
  .dock-bar {
    height: 8vh;
  }
}
</style>
