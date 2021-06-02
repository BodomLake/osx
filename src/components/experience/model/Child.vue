<template>
  <input type="text" :value="inputValue" @input="handleInputEvent">
</template>

<script>
export default {
  name: "Child",
  props: {
    value: {
      type: String,
      default: "",
      required: true,
    }
  },
  data() {
    return {
      inputValue: this.value,
    }
  },
  methods: {
    handleInputEvent(e) {
      let value = e.target.value;
      console.log(value);
      this.inputValue = value;
      this.$emit("customInput", e);
    }
  }
}
</script>

<style scoped>

</style>
