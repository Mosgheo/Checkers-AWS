<template>
  <div id="app">
    <checkers-header/>
    <router-view/>
  </div>
</template>

<script>
import CheckersHeader from './components/CheckersHeader.vue'

export default {
  components: {
    CheckersHeader
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 18px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
