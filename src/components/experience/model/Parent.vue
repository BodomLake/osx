<template>
  <div>
    <!--    <Child v-model="form.name"></Child>-->
    <!--    <Child v-model="form.password"></Child>-->
    <child :value="form.name" @customInput="m1"></child>
    <child :value="form.pwd" @customInput="m2"></child>
  </div>
</template>

<script>
import Child from "./Child";

export default {
  name: "Parent",
  components: {Child},
  data() {
    return {
      form: {
        name: '',
        pwd: ''
      }
    }
  },
  methods: {
    m1(e) {
      console.log('事件', e)
      this.m3('logInformation')
      this.form.name = e.target.value
    },
    m2(e) {
      this.form.pwd = e.target.value
    },
    m3(logInfo) {
      console.log(this)
    }
  }

}
</script>

<style scoped>

</style>
