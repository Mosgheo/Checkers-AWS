<template>
    <div class="centralSpace flex flex-row">
      <Checkerboard class="board flex flex-col"/>
      <Chat class="chat"/>

      <div class="modal modal-change-location">
        <div class="modal-box">
          <p>Sei sicuro di voler abbandonare la partita? In caso affernativo ti verrà assegnata una sconfitta a tavolino</p> 
          <div class="modal-action">
            <label for="my-modal-2" @click="exitGame" class="btn">Accept</label> 
            <label for="my-modal-2" @click="closeModal" class="btn">Close</label>
          </div>
        </div>
      </div>

    </div>
</template>

<script>
import Checkerboard from '@/components/boardComponents/Checkerboard'
import Chat from '@/components/boardComponents/Chat'
import store from '@/store'
import api from '../../api.js'

var changeLocation = false
var path = null

export default {
  name: "Game",
  components: {
      Checkerboard,
      Chat
  },
  methods: {
    closeModal() {
      document.getElementsByClassName("modal-change-location")[0].className = "modal modal-change-location modal-close"
    },
    exitGame() {
      /*if(store.in_game) {
        //api.leave_game(this.$socket, lobbyId)
      } else {
        //api.delete_lobby(this.$socket, lobbyId)
      }*/
      this.$router.push(path)
      changeLocation = true
    }
  },
  beforeRouteLeave(to, from, next) {
    console.log(this.$.components.Checkerboard)
    if(changeLocation) {
      next()
    } else {
      document.getElementsByClassName("modal-change-location")[0].className = "modal modal-change-location modal-open"
      path = to.path
    }
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