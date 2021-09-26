import {v4 as uuidv4} from "uuid";


export class Timer {
  /**
   * 构造函数
   * @param trigger 触发器
   */
  constructor(trigger) {
    // 记录的毫秒数
    this.time = 0;
    // 计时器的id
    this.timer = 0;
    this.id = uuidv4();
    // 指定数据的监听器(time)
    this.$watch = {
      time: trigger
    };
    // 指定要被监听的数据(time)
    this.$data = {
      time: this.time
    };
    this.setData('time')
  }

  /**
   * 开始计时
   * @param step
   */
  start(step) {
    // 没有指定默认50ms计时一次
    if (step == undefined || step == null) {
      step = 50;
    }
    this.time = 0;
    // 开始计时，并且返回计时器id
    this.timer = setInterval(() => {
      this.time += step;
    }, step)
  }

  /**
   * 重开
   * @param step
   */
  restart(step) {
    this.shutdown();
    this.start(step);
  }

  /**
   * 开始计时
   */
  pause() {
    if (this.timer != 0 || this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * 恢复计时
   * @param step
   */
  resume(step) {
    // 没有指定默认50ms计时一次
    if (step == undefined || step == null) {
      step = 50;
    }
    // 开始计时，并且返回计时器id
    this.timer = setInterval(() => {
      this.time += step;
    }, step)
  }

  /**
   * 关掉计时器，并且重置时间归零
   */
  shutdown() {
    this.time = 0;
    this.pause();
  }

  /**
   * setData 让 $watch 劫持数据的set get
   * @param attr 被劫持的属性
   */
  setData(attr) {
    Object.defineProperty(this, attr, {
      get: function () {
        return this.$data[attr];
      },
      set: function (val) {
        const oldVal = this.$data[attr];
        if (oldVal === val) return val;
        this.$data[attr] = val;
        // 如果触发器是函数，就apply()执行它
        this.$watch[attr] && typeof this.$watch[attr] === 'function' && (
          this.$watch[attr].call(this, val, oldVal)
        );
        return val;
      },
    })
  }

  /**
   * 重置触发器
   * @param newTrigger
   */
  setTrigger(newTrigger) {
    this.$watch['time'] = newTrigger
  }
}
