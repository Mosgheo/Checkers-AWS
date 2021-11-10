<template>
<div>
  <div class ="flex flex-row centralSpace">
    <Chat class="chat"/>
    <Checkerboard class="flex flex-col board"/>
    <div class ="flex flex-col rightMenu">
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
  width: 100%;
  height: 100%;
  padding: 1em 0em 0.6em 1em
}
.board {
  margin-left: 5em;
}
.chat {
  margin: 5.2em 2em 0em 0em;
  max-width: 300px;
}
.rightMenu {
  margin-right: 8em;
}
.rightMenu button:first-child {
  margin-top: 6.8em;
}
.rightMenu button {
  margin-top: 4em;
  max-width: 205px;
  margin-left: 3em;
}

@media (max-width: 1700px) {
  .rightMenu button {
    min-width: 130px;
    margin-top: 2em;
  }
  .board {
    margin-left: 1em;
  }
} 

@media (max-width: 1200px) {
  .rightMenu button {
    visibility: hidden
  }
  .chat {
    margin-left: 1.5em;
    margin-right: 0em;
  }
} 

@media (max-width: 850px) {
  .board {
    margin-left: 0.8em;
  }
} 
</style>