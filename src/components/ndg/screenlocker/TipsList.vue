<template>
  <div class="tips-list" draggable="false"
       @dragstart="listDragStart($event)" @dragover="listDragOver($event)">
    <div style="height: 100%;width: 100%" :style="{'transform': scrollOffset}">
      <template v-for="(tip,tidx) in tipList">
        <div class="item" :style="{'max-height': defaultHeight, 'height': defaultHeight}">
          <tip-bar :tip="tip" :tidx="tidx"
                   @enterApp="enterApp" @startDrag="setDragId" @dragAct="crossDragOver">
          </tip-bar>
        </div>
      </template>
    </div>

  </div>
</template>

<script>
import TipBar from "@/components/ndg/screenlocker/TipBar";
import {v4 as uuidv4} from "uuid";

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
            time: Math.ceil(30 * Math.random(0, 1)),
            title: '私信箱',
            subTitle: '您收到一条私信...',
            detail: '你好啊，很高兴认识你！',
            id: uuidv4()
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
    for (let i = 0; i < 6; i++) {
      const example = {
        app: 'we-chat',
        name: '微信',
        time: Math.ceil(30 * Math.random(0, 1)),
        title: '公众号',
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
      dragId: '',
      offset: 0,
    }
  },
  computed: {
    defaultHeight() {
      return 100 / this.displayNum + '%';
    },
    scrollOffset() {
      return `translateY(${this.offset}px)`
    },
  },
  methods: {
    enterApp(tid) {
      let app = this.tipList[tid]
      this.$emit('enterApp', app)
    },
    setDragId(tid) {
      console.log('被拉拽的tid', tid)
      this.dragId = tid;
    },
    crossDragOver(clientX) {
      for (let i = 0; i < this.$children.length; i++) {
        let child = this.$children[i]
        if (child.$el.id == this.dragId) {
          child['crossDragOver'](clientX)
          break;
        }
      }
    },
    listDragStart($event) {
      console.log($event.screenX, $event.screenY, 'list-drag-start')
    },
    listDragOver($event) {
      console.log($event.screenX, $event.screenY, 'list-drag-over')
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
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
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
</style>
