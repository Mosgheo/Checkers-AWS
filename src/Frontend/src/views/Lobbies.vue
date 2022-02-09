<template>
  <div class="lobbies overflow-x-auto py-8 px-5">
    <table class="table w-full">
      <thead>
        <tr>
          <th>Lobby Owner</th> 
          <th>Name Lobby</th> 
          <th>Max stars</th>
          <th>Join</th>
        </tr>
      </thead> 
      <tbody v-for="(lobby, index) in res" :key="index">
        <tr>
          <td :textContent="lobby.host"></td> 
          <td :textContent="lobby.name"></td> 
          <td :textContent="lobby.max_stars"></td>
          <td><router-link class="join-lobby btn" to="/inGame" @click="joinLobby(lobby.lobby_id)">Join Lobby</router-link></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '../../api.js'
import { getCurrentInstance } from 'vue'

var appInstance = null

export default {
  name: "Lobbies",
  setup() {
    appInstance = getCurrentInstance().appContext.config.globalProperties
  },
  data() {
    return {
      res: [],
      join: null
    }
  },
  methods: {
    joinLobby(id) {
      appInstance.$BUTTON_CLICK.play()
      if(this.res.length > 0) {
        api.join_lobby(this.$socket, id)
      }
    }
  },
  sockets: {
    lobbies(res) {
      this.res = res
    }
  }
}
</script>

<style scoped>
</style>