<template>
<div>
  <div class ="centralSpace">
    <Checkerboard class="board"/>
    <div class ="rightMenu">
      <button class="btn" @click="newGame">Crea lobby</button> 
      <button class="btn">Unisciti ad una lobby</button> 
      <button class="btn">CPU</button> 
      <button class="btn">Aggiungi amico</button> 
      <button class="btn">Invita amico</button> 
    </div>
  </div>
</div>
</template>

<script>
import Checkerboard from '@/components/boardComponents/Checkerboard'

export default {
  name: 'Home',
  components: {
    Checkerboard
  },
  methods: {
    newGame() {
      this.$emit("newGame")
    }
  }
}
</script>

<style scoped>
.centralSpace{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
}
.rightMenu {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 2;
}
.board {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 7;
  margin-right: 5%
}
.rightMenu button:not(:first-child) {
  margin-top: 10%;
}
</style>