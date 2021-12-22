<template>
    <div class="centralSpace flex flex-row">
        <Checkerboard class="board flex flex-col"/>
        <Chat class="chat"/>
    </div>
</template>

<script>
import Checkerboard from '@/components/boardComponents/Checkerboard'
import Chat from '@/components/boardComponents/Chat'
export default {
  name: "Game",
  components: {
      Checkerboard,
      Chat
  }
}
</script>

<style scoped>
.chat {
  margin-right: 10rem;
  margin-top: 5em;
}
@media (max-width: 1700px) {
  .chat {
    margin-left: 2em;
  }
}
</style>