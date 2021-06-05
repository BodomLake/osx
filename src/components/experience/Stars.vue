<template>
  <div class="body">
    <div class="stars">
      <div class="star" v-for="(item, index) in starsCount" :key="index" ref="star"></div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        starsCount: 800,
        distance: 900
      };
    },

    mounted() {
      let starNodes = Array.from(this.$refs.star);
      starNodes.forEach(item => {
        let speed = 0.1 + Math.random() * 1;
        let randomDistance = this.distance + Math.random() * 300;
        item.style.transformOrigin = `0 0 ${randomDistance}px`;
        item.style.transform = `
                translate3d(0,0,-${randomDistance}px)
                rotateY(${Math.random() * 360}deg)
                rotateX(${Math.random() * -50}deg)
                scale(${speed},${speed})`;
                
      });
    }
  };
</script>

<style lang="css" scoped>
.body {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0%;
  left: 0%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: radial-gradient(
    200% 100% at bottom center,
    #f7f7b6,
    #e96f92,
    #1b2947
  );
  background: radial-gradient(
    200% 105% at top center,
    #1b2947 10%,
    #75517d 40%,
    #e96f92 65%,
    #f7f7b6
  );
  background-attachment: fixed;
  overflow: hidden;
}

@keyframes rotate {
  0% {
    transform: perspective(400px) rotateZ(20deg) rotateX(-40deg) rotateY(0);
  }
  100% {
    transform: perspective(400px) rotateZ(20deg) rotateX(-40deg)
      rotateY(-360deg);
  }
}
.stars {
  transform: perspective(500px);
  transform-style: preserve-3d;
  position: absolute;
  perspective-origin: 50% 100%;
  left: 45%;
  animation: rotate 370s infinite linear;
  bottom: 0;
}
.star {
  width: 2px;
  height: 2px;
  background: #f7f7b6;
  position: absolute;
  left: 0;
  top: 0;
  backface-visibility: hidden;
  border-radius: 50%;
}
</style>