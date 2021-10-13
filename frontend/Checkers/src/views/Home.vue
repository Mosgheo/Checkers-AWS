<template>
<div>
  <Sidebar />
  <!-- <div class ="leftMenu"><p></p></div> -->
  <div :style="{ 'margin-left': sidebarWidth }"></div>
  <div class ="centralSpace">
      <Checkerboard/>
  </div>
  <div class ="rightMenu"></div>
  <div class ="bottonMenu"></div>
</div>
</template>

<script>
import Sidebar from '@/components/sidebar/Sidebar'
import {sidebarWidth} from '@/components/sidebar/state'
import Checkerboard from '@/components/Checkerboard'

export default {
  name: 'Home',
  components: {
    Checkerboard,
    Sidebar
  },
  setup() {
    return { sidebarWidth }
  }
}
</script>

<style>
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
