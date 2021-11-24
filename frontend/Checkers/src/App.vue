<template>
  <div id="app">
    <div class="flex flex-row">
      <Sidebar class="sidebar flex-none" />
      <div class="middle flex-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/sidebarComponents/Sidebar'
import {sidebarWidth} from '@/components/sidebarComponents/state'

export default {
  components: {
    Sidebar
  },
  setup() {
    return { sidebarWidth }
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
  color: #A39D8F;
}

.middle {
  background-color: #343232;
}
</style>
