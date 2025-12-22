<script setup>
</script>

<template>
  <router-view />
</template>

<style>
/* Global reset to prevent scrolling issues */
:root {
  touch-action: pan-x pan-y;
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  overscroll-behavior: none;
  -webkit-font-smoothing: antialiased;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
