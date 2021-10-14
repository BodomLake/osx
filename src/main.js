// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/index'

Vue.config.productionTip = false
import draggable from "vuedraggable";
Vue.component('draggable', draggable)

import VueDND from 'awe-dnd';
Vue.use(VueDND)

/* eslint-disable no-new */
let vue = new Vue({
  el: '#app',
  router,
  store,
  components: {App},
  template: '<App/>'
})
export default vue;
