
export default {
  name: 'mobile',
  data() {
    return {}
  },
  methods: {
    // 移动端适配 事件
    touchstart($event) {
      console.info("touchstart", $event)
      $event.preventDefault()
    },
    touchmove($event) {
      console.info("touchmove", $event)
    },
    touchend($event) {
      $event.stopPropagation()
      if (this.$refs["modal"].showModal == false)
        this.$refs["modal"].toggle()
      console.info("touchend", $event)
    },
  }
}
