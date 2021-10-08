<template>
<div>
  <div class ="leftMenu"><p></p></div>
  <div class ="centralSpace">
      <Checkerboard/>
  </div>
  <div class = "rightMenu"></div>
  <div class ="bottonMenu"></div>
</div>
</template>

<script>
import Checkerboard from '../components/Checkerboard.vue'

export default {
  name: 'Home',
  components: {
    Checkerboard
  }
}
</script>
