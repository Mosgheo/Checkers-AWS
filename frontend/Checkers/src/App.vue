<template>
  <div id="app">
    <div class="grid grid-cols-10">
      <Sidebar class="sidebar" />
      <div class="middle col-start-2 col-span-9">
        <!--<div :style="{ 'margin-left': sidebarWidth }"></div>-->
        <router-view class="content"/>
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

.header {
  margin-bottom: 0.5em;
  margin-top: 0.5em;
}

.middle {
  background-color: #343232;
}
</style>
