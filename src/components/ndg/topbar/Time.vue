<template>
  <div class="time">
    <!--<div style="display: inline; font-size: 12px;">{{ currentDate }}</div>-->
    <div style="display: inline; font-size: 12px; color: white">{{ week }} {{ currentTime }}</div>
  </div>
</template>

<script>
import TimeMixin from '../common/time'

export default {
  name: "Time",
  data() {
    return {}
  },
  mixins: [TimeMixin],
  computed: {},
  created() {
  },
  methods: {},
  filters: {}
}
</script>

<style scoped>

</style>
