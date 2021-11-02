<template>
  <div id="app">
    <div class="row">
      <div class="column">
        <Sidebar class="sidebar" />
      </div>
      <div class="middle">
        <checkers-header class="header" />
        <!--<div :style="{ 'margin-left': sidebarWidth }"></div>-->
        <router-view class="content"/>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/sidebarComponents/Sidebar'
import {sidebarWidth} from '@/components/sidebarComponents/state'
import CheckersHeader from './components/CheckersHeader.vue'

export default {
  components: {
    CheckersHeader,
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
  color: #2c3e50;
}

.header {
  margin-bottom: 0.5em;
  margin-top: 0.5em;
}

.row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
}

.column {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 2;
}

.middle {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 8;
  padding: 0.5em;
  padding-bottom:100%;
  background-color: #fafaf0;
}

.content {
  padding: 2em;
}
</style>
