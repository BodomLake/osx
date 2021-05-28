<template>
  <div class="my-icon">
    <!-- <remote-js :src="src"></remote-js> -->
    <svg class="icon svg-icon" :class="{'singleBox':singleBox}" aria-hidden="true" width="100%" height="100%" preserveAspectRatio="none">
      <use :xlink:href="'#icon-' + className"></use>
    </svg>
  </div>
</template>
<script>
  // const src = "//at.alicdn.com/t/font_2566639_p40hylpk87.js";
  // const src = "../assets/iconfont.js"
  export default {
    name: "my-icon",
    // components: {
    //   "remote-js": {
    //     render(createElement) {
    //       return createElement("script", {
    //         attrs: { type: "text/javascript", src: this.src }
    //       });
    //     },
    //     props: {
    //       src: { type: String, required: true }
    //     }
    //   }
    // },
    beforeCreate() {},
    data() {
      return {
        // src: src
      };
    },
    props: {
      className: {
        type: String,
        default: () => {
          return "";
        }
      },
      singleBox: {
        type: Boolean,
        default: () => {
          return false;
        }
      }
    },
    mounted() {}
  };
</script>
<style scoped>
.my-icon {
  display: inline;
  /* margin: 0.05rem; */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
}
.icon {
  width: 3.5em;
  height: 3.5rem;
  fill: currentColor;
  overflow: hidden;
}
.singleBox {
  width: 8em;
  height: 8rem;
}
</style>
