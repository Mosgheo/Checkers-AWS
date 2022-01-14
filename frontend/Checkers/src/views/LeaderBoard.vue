<template>
<div class="leaderboard overflow-x-auto">
  <table class="table w-full shadow">

    <thead>
      <tr>
        <th>Pos</th> 
        <th>Nome</th> 
        <th>Punti</th> 
        <th>Partite giocate</th> 
        <th>Vittorie</th> 
        <th>Sconfitte</th> 
      </tr>
    </thead>

    <tbody>
      <template v-for="(user, i) in this.leaderboard" :key="i">
        <tr>
          <th :textContent="'#' + (i+1)"></th>
          <td>
            <div class="flex items-center space-x-3">
              <div class="avatar">
                <div class="w-12 h-12 mask mask-squircle">
                  <img src="https://picsum.photos/id/1005/400/250" alt="Avatar Tailwind CSS Component">
                </div>
              </div> 
              <div>
                  <div class="font-bold">
                      {{ user.username }}
                  </div> 
                  <div class="text-sm opacity-50">
                      Nazione
                  </div>
              </div>
            </div>
          </td>
          <td>
              {{ user.stars }}
            <br>
          </td> 
          <td>{{ user.losses + user.wins }}</td>
          <td>{{ user.wins }}</td>
          <td>{{ user.losses }}</td>
        </tr>
      </template>
    </tbody> 
  </table>
</div>
</template>

<script>
import api from '@/../api.js'

export default {
  name: "LeaderBoard",
  data() {
    api.get_leaderboard(this.$socket)

    return {
      leaderboard: null
    }
  },
  sockets: {
    leaderboard(res) {
      this.leaderboard = res
    }
  }
}
</script>

<style scoped>
.leaderboard {
  padding: 3.8em 3.8em 2em 15em
}
</style>