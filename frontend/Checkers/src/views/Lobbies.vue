<template>
  <div class="lobbies overflow-x-auto">
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

export default {
  name: "Lobbies",
  data() {
    return {
      res: [],
      join: null
    }
  },
  methods: {
    joinLobby(id) {
      if(this.res.length > 0) {
        console.log("There is some lobbies!!!!")
        console.log(id)
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
.lobbies {
  padding: 3.8em 3.8em 2em 15em
}
</style>