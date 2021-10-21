<template>
  <div style="height: 100%;width: 100%">
    <div class="tips-list" draggable="false"
         @dragstart="listDragStart($event)" @dragover="listDragOver($event)">
      <div style="height: 100%;width: 100%" :style="{'transform': scrollOffset}">
        <template v-for="(tip,tidx) in tipList">
          <div class="item" :style="{'max-height': defaultHeight, 'height': defaultHeight}">
            <tip-bar :tip="tip" :tidx="tidx"
                     @enterApp="enterApp" @dragEnd="endDrag" @startDrag="startDrag" @dragAct="crossDragOver">
            </tip-bar>
          </div>
        </template>
        <div class="rest-bar" v-show="tipList.length < displayNum">
          <div class="rest-app-bar"></div>
          <div class="clear-all">清除所有</div>
        </div>
      </div>
    </div>
    <template>
      <div class="outer-bar-locate rest-bar" v-show="tipList.length >= displayNum">
        <div class="rest-app-bar"></div>
        <div class="clear-all">清除所有</div>
      </div>
    </template>

  </div>

</template>

<script>
import TipBar from "@/components/ndg/screenlocker/TipsList/TipBar";
import {v4 as uuidv4} from "uuid";
import {Timer} from "@/components/ndg/timer";

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
            time: Math.ceil(30 * Math.random()),
            title: '私信箱',
            subTitle: '您收到一条私信...',
            detail: '你好啊，很高兴认识你！',
            id: uuidv4()
          },
          {
            app: 'zhifubao',
            name: '支付宝',
            time: Math.ceil(30 * Math.random()),
            title: '收款',
            subTitle: '您收到一笔收款待查收...',
            detail: '收款50元',
            id: uuidv4()
          },
          {
            app: 'eliaomo',
            name: '饿了么',
            time: Math.ceil(30 * Math.random()),
            title: '订单状态',
            subTitle: '骑手正在派送中',
            detail: '剩余时间30min',
            id: uuidv4()
          },
          {
            app: 'taobao',
            name: '淘宝',
            time: Math.ceil(30 * Math.random()),
            title: '提醒',
            subTitle: '你关注的商品减价了',
            detail: '直降30￥',
            id: uuidv4()
          },
          {
            app: 'we-chat',
            name: '微信',
            time: Math.ceil(30 * Math.random()),
            title: '公众号',
            subTitle: '您订阅的实战精英有新文章发布',
            detail: '猪肉上市公司财报浅析',
            id: uuidv4(),
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
    const youxiang = {
      app: 'QQyouxiang',
      name: 'QQ邮箱',
      time: Math.ceil(30 * Math.random()),
      title: '来信提醒',
      subTitle: 'http://github.com/BodomLake/webpack-demo',
      detail: 'vue-draggable',
      id: uuidv4()
    }
    this.tipList.push(youxiang)
    for (let i = 0; i < 1; i++) {
      const example = {
        app: 'we-chat',
        name: '微信',
        time: Math.ceil(30 * Math.random()),
        title: '公众号' + Math.ceil(100 * Math.random()),
        subTitle: '您订阅的实战精英有新文章发布...',
        detail: '猪肉上市公司财报浅析',
        id: uuidv4(),
      }
      this.tipList.push(example)
    }
  },
  model: {
    prop: 'tipList',
    event: 'tipListChange'
  },
  data() {
    return {
      // 被拖拽的Bar的id
      dragBarId: '',
      // 纵向位移量
      offsetY: 0,
      timer: new Timer(),
      // 拖拽的速度，决定是否要拉到底
      speed: 0,

    }
  },
  computed: {
    defaultHeight() {
      return 100 / this.displayNum + '%';
    },
    scrollOffset() {
      return `translateY(${this.offsetY}px)`
    },
  },
  methods: {
    enterApp(tid) {
      let app = this.tipList[tid]
      this.$emit('enterApp', app)
    },
    startDrag(tid, startPos) {
      // console.log('被拉拽的tid', tid)
      this.dragBarId = tid;
      this.startPos = startPos;
      this.timer.start();
    },
    /**
     * 拖拽结束了
     */
    endDrag() {
      this.timer.shutdown()
    },
    crossDragOver(clientX) {
      for (let i = 0; i < this.$children.length; i++) {
        let child = this.$children[i]
        if (child.$el.id == this.dragBarId) {
          child['crossDragOver'](clientX)
          break;
        }
      }
    },
    listDragStart($event) {
      console.log($event.screenX, $event.screenY, 'list-drag-start')
    },
    listDragOver($event) {
      // console.log($event.screenX, $event.screenY, 'list-drag-over')
    }
  }
}
</script>

<style scoped>
.tips-list {
  height: inherit;
  width: 40vw;
  position: relative;
  left: 50%;
  transform: translate(-50%, 0);
  overflow-y: auto;
  overflow-x: hidden;
  /*  display: flex;
    flex-wrap: wrap;
    align-content: flex-start;*/
}

.tips-list::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.tips-list .item {
  width: 100%;
  justify-items: center;
}

@media screen and  (orientation: portrait) {
  .tips-list {
    width: 40vh;
  }
}

.outer-bar-locate {
  left: 50%;
  transform: translateX(-50%);
  position: fixed;
  width: 40vw;
  height: 3vh;
}

.rest-bar {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 6px 6px 6px 6px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 3vh;
}

.rest-app-bar {
  width: 80%;
  overflow-x: scroll;
}

.rest-app-bar::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.clear-all {
  width: 20%;
  color: skyblue;
  font-weight: 600;
  font-size: 1.8vmin;
  user-select: none;
  cursor: url("/static/cursor/link.cur"), auto;
}
</style>
