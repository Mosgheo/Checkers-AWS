<template>
<div>
  <div class ="centralSpace">
    <Checkerboard />
    <div class ="rightMenu"></div>
  </div>
</div>
</template>

<script>
import Checkerboard from '@/components/Checkerboard'

export default {
  name: 'Home',
  components: {
    Checkerboard
  }
}
</script>