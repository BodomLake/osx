<template>
  <div style="margin:0 auto;padding:0;">
    <template v-if="$route.path == '/home'">
      <!-- 
      <router-link to="/draggableDND">DraggableDND</router-link>
      <router-link to="/folderList">FolderList</router-link>
      <router-link to="/DND">DND</router-link>
      <router-link to="/doubleDND">doubleDND</router-link>
      <router-link to="/Grid">NineGrid</router-link>
      <router-link to="/parent">Parent</router-link> -->
      <router-link to="/stars">Stars</router-link>
      <router-link to="/nestedDragGrid">NestedDragGrid</router-link>
      <router-link to="/ndg">ndg</router-link>
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
