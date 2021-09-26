export default {
  name: 'listener',
  data() {
    return {}
  },
  mounted() {
    // 定位，格式化，初始化
    this.initBOX()
    setTimeout(() => {
      // this.square()
    }, 300)
    this.$forceUpdate()

    window.addEventListener("resize", $event => {
      // 防抖 100ms 延时执行
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
      }
      this.resizeTimer = window.setTimeout(() => {
        console.info("全局 resize...")
        this.locateBOX()
        // this.square()
        this.portrait = window.innerHeight > window.innerWidth
      }, 100)
    })
    window.addEventListener("keydown", $event => {
      let keyCode = $event.key
      // debugger
      switch (keyCode) {
        case "ArrowLeft":
          this.switchUnit(-1)
          $event.preventDefault()
          break
        case "ArrowRight":
          this.switchUnit(1)
          $event.preventDefault()
          break
        case "ArrowUp":
          break
        case "ArrowDown":
          break
        case "Escape":
          if (this.$refs["modal"].showModal) this.$refs["modal"].toggle()
        default:
      }
    })
    window.addEventListener("click", $event => {
      // 需要获取modal的主体范围 判断是否在其中？决定是否关闭
      if (this.$refs["modal"].showModal) this.$refs["modal"].toggle()
    })
    window.addEventListener("touchend", $event => {
      if (this.$refs["modal"].showModal) this.$refs["modal"].toggle()
    })
    // 初始化长按状态
    window.addEventListener("mousedown", $event => {
      this.longPress.timer = Date.now()
      this.longPress.moveFlag = false
      this.longPress.flag = false
      this.longPress.startPos.x = $event.clientX
      this.longPress.startPos.y = $event.clientY
    })
    // 判断是否进入长按，长按就意味着要使用拖拽模式
    window.addEventListener("mouseup", $event => {
      this.longPress.endPos.x = $event.clientX
      this.longPress.endPos.y = $event.clientY
      let delta = Date.now() - this.longPress.timer
      let offsetX = Math.abs(
        this.longPress.endPos.x - this.longPress.startPos.x
      )
      let offsetY = Math.abs(
        this.longPress.endPos.y - this.longPress.startPos.y
      )
      // 只要移动距离没有超出5px的原型就算是没有移动，可以计入静止的长按
      this.longPress.moveFlag = offsetX > 5 && offsetY > 5
      // 时间长度大于1000毫秒，并且鼠标中途没有移动，并且没有处于长按模式
      if (
        delta > 500 &&
        this.longPress.moveFlag == false &&
        this.longPress.flag == false
      ) {
        this.longPress.flag = true
        console.info(delta / 1000, "秒", "触发长按", this.longPress.flag)
        // 启用拉拽模式
        this.enableDrag = true
      } else if (delta < 500 && delta > 200) {
        console.info(delta / 1000, "秒", "不算触发长按")
      } else {
        // console.info(this.longPress.moveFlag ? "已经移动了" : "鼠标未移动")
      }
    })
    // 双击退出拉拽模式
    window.addEventListener("dblclick", $event => {
      this.longPress.flag = false
      this.longPress.moveFlag = false
      this.isDragging = false
      this.enableDrag = false
      this.locateBOX()
    })
  },
}
