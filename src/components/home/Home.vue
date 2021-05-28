<template>
  <div style="margin:0 auto;padding:0;">
    <template v-if="$route.path == '/home'">
      <!-- <router-link to="/home/helloWorld">helloworld</router-link>
      <router-link to="/home/draggableDND">DraggableDND</router-link>
      <router-link to="/home/folderList">FolderList</router-link>
      <router-link to="/home/DND">DND</router-link>
      <router-link to="/home/doubleDND">doubleDND</router-link>
      <router-link to="/home/Grid">NineGrid</router-link>
      <router-link to="/home/parent">Parent</router-link> -->
      <router-link to="/stars">Stars</router-link>
      <router-link to="/nestedDragGrid">NestedDragGrid</router-link>
    </template>
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
  export default {
    name: "Home",
    updated() {
      console.log(this.$route);
    },
    created() {
      console.log(this.$route);
    }
  };
</script>

<style scoped></style>
