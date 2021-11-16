export default class Reactive {
  constructor($data, $watch) {
    this.$data = $data || {};
    this.$watch = $watch || {};
    // 默认可以改变 否定的否定就是 mutable
    this.immutable = false;
  }

  setImmutable(flag) {
    this.immutable = flag
  }

  // 添加响应式
  defineReactive(key) {
    if (!this.hasOwnProperty(key)) {
      console.warn('the key: ' + key + ' is not defined in ' + this.constructor.name)
      return;
    }
    if (!this.$data.hasOwnProperty(key)) {
      console.warn('the reactive attr "' + key + '" in ' + this.constructor.name + '.$data not found')
      return;
    }
    Object.defineProperty(this, key, {
      get: function () {
        return this.$data[key];
      },
      set: function (val) {
        const oldVal = this.$data[key];
        if (oldVal === val) {
          return val;
        }
        // 是否被截留？
        val = this.$watch[key] && typeof this.$watch[key] === 'function'
          && this.$watch[key].call(this, val, oldVal) || val
        // 没有截留直接返回
        this.$data[key] = val
        return val;
      },
    })
  }
}
