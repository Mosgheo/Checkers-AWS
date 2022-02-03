<template>
    <div class="centralSpace flex flex-row justify-center px-20 py-10">
      <Checkerboard class="board flex flex-col"/>
      <Chat :lobbyId="this.lobbyId" class="chat mt-28"/>

      <div class="modal modal-change-location">
        <div class="flex flex-col items-center modal-box">
          <img class="w-40 h-28" src="@/assets/msg_image.png" />
          <p class="text-base font-semibold" id="exit-game-msg"></p> 
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

var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

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
      lobbyId: null
    }
  },
  methods: {
    closeModal() {
      button_click.play()
      modal[0].className = "modal modal-change-location"
    },
    exitGame() {
      button_click.play()
      if(this.lobbyId === null || this.lobbyId === undefined) {
        api.get_lobbies(this.$socket, store.state.user.stars)
      }
      if(store.state.in_game && changeLocation === false) {
        api.leave_game(this.$socket, this.lobbyId)
        document.getElementById("exit-game-msg").innerHTML = "Sei sicuro di voler abbandonare la partita? In caso affernativo ti verrà assegnata una sconfitta a tavolino"
        changeLocation = true
      } else if(changeLocation === false) {
        api.delete_lobby(this.$socket, this.lobbyId)
        document.getElementById("exit-game-msg").innerHTML = "La lobby verrà eliminata, confermare per uscire dalla lobby"
        changeLocation = true
      }
      this.$router.push(path)
    },
  },
  sockets: {
    lobbies(res) {
      if(this.lobbyId === null || this.lobbyId === undefined) {
        this.lobbyId = res.lobby_id
      }
    },
    left_game(res) {
      console.log(res)
    },
    opponent_left(msg) {
      changeLocation = true
      path = "/"
      document.getElementById("exit-game-msg").innerHTML = "L'avversario ha abbandonato la partita, ti verranno assegnati dei punti per vittoria a tavolino"
      modal[0].className = "modal modal-change-location modal-open"
    },
    game_ended(msg) {
      changeLocation = true
      path = "/"
      var gameEndModal = document.getElementsByClassName("modal")[0]
      document.getElementById("exit-game-msg").innerHTML = msg.message
      gameEndModal.setAttribute("class", "modal modal-change-location modal-open")
    },
    game_started(res) {
      this.lobbyId = res[3]
      store.commit('setInGame', true)
    }
  },
  beforeRouteLeave(to, from, next) {
    if(changeLocation) {
      store.commit('setInGame', false)
      changeLocation = false
      next()
    } else {
      if(store.state.in_game && changeLocation === false) {
        document.getElementById("exit-game-msg").innerHTML = "Sei sicuro di voler abbandonare la partita? In caso affernativo ti verrà assegnata una sconfitta a tavolino"
      } else if(changeLocation === false) {
        document.getElementById("exit-game-msg").innerHTML = "La lobby verrà eliminata, confermare per uscire dalla lobby"
      }
      modal[0].className = "modal modal-change-location modal-open"
      path = to.path
    }
  }
}
</script>

<style scoped>
.centralSpace {
  background-color: #343232;
}
.modal-box {
  background-color: #343232;
}
@media only screen and (max-width: 1700px) {
  .chat {
    margin-left: 2em;
  }
}
@media only screen and (max-width: 650px) {
  .centralSpace {
    flex-direction: column;
    padding-left: 1.3rem;
  }
  .chat {
    margin-top: 1rem;
    margin-left: 0;
  }
  .board {
    max-width: 30rem;
  }
}
</style>