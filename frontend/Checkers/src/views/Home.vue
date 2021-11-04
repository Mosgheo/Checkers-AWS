<template>
<div>
  <div class ="centralSpace">
    <Chat class="chat"/>
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
import Chat from '@/components/boardComponents/Chat'

export default {
  name: 'Home',
  components: {
    Checkerboard,
    Chat
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
  padding: 1em 0em 0.6em 4em
}
.chat {
  margin: 6em 2em 0em 0em;
  width: 300px;
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
  flex: 4;
}
.rightMenu button:first-child {
  margin-top: 8em;
}
.rightMenu button {
  margin-top: 4em;
  max-width: 205px;
  margin-left: 5em;
}
</style>