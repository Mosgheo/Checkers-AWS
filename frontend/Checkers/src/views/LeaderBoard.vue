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
      <template v-for="(user, i) in this.currentPage" :key="i">
        <tr>
          <th :textContent="'#' + ((this.leaderboard.indexOf(this.currentPage[i]))+1)"></th>
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

  <div v-if="this.leaderboard.length > this.perPage" class="btn-group mt-4">
    <button @click="previousPage($event)" class="btn btn-disabled btn-outline btn-wide">Previous</button> 
    <button @click="nextPage($event)" class="btn btn-outline btn-wide">Next</button>
  </div>
  <div v-else class="btn-group mt-4">
    <button @click="previousPage($event)" class="btn btn-disabled btn-outline btn-wide">Previous</button> 
    <button @click="nextPage($event)" class="btn btn-disabled btn-outline btn-wide">Next</button>
  </div>
</div>
</template>

<script>
import api from '@/../api.js'

export default {
  name: "LeaderBoard",
  data() {
    api.get_leaderboard(this.$socket)

    return {
      leaderboard: null,
      currentPage: [],
      perPage: 12,
      page: 1
    }
  },
  methods: {
    nextPage(button) {
      this.currentPage = []
      for(let i = (this.perPage*this.page); i < (this.page + 1)*this.perPage; i++) {
        if(this.leaderboard[i] === undefined) {
          break;
        }
        this.currentPage.push(this.leaderboard[i])
      }
      this.page++
      if(this.leaderboard.at(-1) === this.currentPage.at(-1)) {
        button.path[1].children[1].setAttribute("class", "btn btn-disabled btn-outline btn-wide")
      }
      if(button.path[1].children[0].className.includes("disabled")) {
        button.path[1].children[0].setAttribute("class", "btn btn-outline btn-wide")
      }
    },
    previousPage(button) {
      this.currentPage = []
      var fillTo = ((this.perPage*this.page)-1) - this.perPage
      for(let i = (fillTo - this.perPage)+1; i <= fillTo; i++) {
        if(this.leaderboard[i] === undefined) {
          break;
        }
        this.currentPage.push(this.leaderboard[i])
      }
      this.page--
      if(this.leaderboard[0] === this.currentPage[0]) {
        button.path[1].children[0].setAttribute("class", "btn btn-disabled btn-outline btn-wide")
      }
      if(button.path[1].children[1].className.includes("disabled")) {
        button.path[1].children[1].setAttribute("class", "btn btn-outline btn-wide")
      }
    }
  },
  sockets: {
    leaderboard(res) {
      this.leaderboard = res
      for(let i = 0; i < this.perPage; i++) {
        if(this.leaderboard[i] === undefined) {
          break;
        }
        this.currentPage.push(this.leaderboard[i])
      }
    }
  }
}
</script>

<style scoped>
.leaderboard {
  padding: 3.8em 3.8em 2em 15em
}
</style>