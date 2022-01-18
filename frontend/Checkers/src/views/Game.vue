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

var modal =  document.getElementsByClassName("modal-change-location")

export default {
  name: "Game",
  components: {
    Checkerboard,
    Chat
  },
  data() {
    return {
      lobbyId: this.$route.params.id
    }
  },
  methods: {
    closeModal() {
      modal[0].className = "modal modal-change-location modal-close"
    },
    exitGame() {
      console.log(this.lobbyId)
      if(store.state.in_game) {
        api.leave_game(this.$socket, this.lobbyId)
        store.state.in_game = false
      } else {
        api.delete_lobby(this.$socket, this.lobbyId)
      }
      this.$router.push(path)
      changeLocation = true
    }
  },
  sockets: {
    lobbies(res) {
      this.lobbyId = res.lobby_id
    },

  },
  beforeRouteLeave(to, from, next) {
    if(this.lobbyId === undefined) {
      api.get_lobbies(this.$socket, store.state.user.stars)
    }
    if(changeLocation) {
      changeLocation = false
      next()
    } else {
      modal[0].className = "modal modal-change-location modal-open"
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
.centralSpace {
  background-color: #343232;
}
@media (max-width: 1700px) {
  .chat {
    margin-left: 2em;
  }
}
</style>