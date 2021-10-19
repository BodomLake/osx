<template>
  <div class="tipslist">
    <template v-for="(tip,tid) in tipList">
      <div class="item" :style="{'max-height': defaultHeight, 'height': defaultHeight}">
        <tip-bar :tip="tip" @enterApp="enterApp(tid)"></tip-bar>
      </div>
    </template>
  </div>
</template>

<script>
import TipBar from "@/components/ndg/screenlocker/TipBar";

export default {
  name: "TipsList",
  components: {TipBar},
  props: {
    tipList: {
      required: false,
      type: Array,
      default: () => {
        return [
          {
            app: 'wangyiyun',
            name: '网易云音乐',
            time: new Date().getMinutes(),
            title: '私信箱',
            subTitle: '您收到一条私信...',
            detail: '你好啊，很高兴认识你！'
          },
        ]
      }
    },
    displayNum: {
      require: false,
      type: Number,
      default: 6
    },
  },
  mounted() {
    const test = {
      app: 'we-chat',
      name: '微信',
      time: new Date().getDay(),
      title: '公众号',
      subTitle: '您订阅的实战精英有新文章发布...',
      detail: '猪肉上市公司财报浅析'
    }
    for (let i = 0; i < 6; i++) {
      this.tipList.push(test)
    }
  },
  model: {
    prop: 'tipList',
    event: 'tipListChange'
  },
  computed: {
    defaultHeight() {
      return 100 / this.displayNum + '%';
    }
  },
  methods: {
    enterApp(tid) {
      let app = this.tipList[tid]
      this.$emit('enterApp', app)
    }
  }
}
</script>

<style scoped>
.tipslist {
  height: inherit;
  width: 40vw;
  position: relative;
  left: 50%;
  transform: translate(-50%, 0);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

.tipslist::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.tipslist .item {
  width: 100%;
  justify-items: center;
}

@media screen and  (orientation: portrait) {
  .tipslist {
    width: 40vh;
  }
}
</style>
