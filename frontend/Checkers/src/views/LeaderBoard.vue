<template>
<div class="main-div flex flex-col justify-center px-32 py-14">
  <div class="mb-10">
    <h1 class="font-bold text-3xl">Classifica globale</h1>
  </div>
  <div class="leaderboard overflow-x-auto">
    <table class="table table-compact w-full shadow">

      <thead>
        <tr>
          <th>Posizione</th> 
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

    <div v-if="this.leaderboard.length > this.perPage" class="flex mt-3 justify-center">
      <button @click="previousPage($event)" class="btn mr-5 btn-disabled">Previous</button> 
      <button @click="nextPage($event)" class="btn">Next</button>
    </div>
    <div v-else class="btn-group mt-4">
      <button @click="previousPage($event)" class="btn mr-5 btn-disabled ">Previous</button> 
      <button @click="nextPage($event)" class="btn btn-disabled">Next</button>
    </div>

  </div>
</div>
</template>

<script>
import api from '@/../api.js'

var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

export default {
  name: "LeaderBoard",
  data() {
    api.get_leaderboard(this.$socket)

    return {
      leaderboard: [],
      currentPage: [],
      perPage: 15,
      page: 1
    }
  },
  methods: {
    nextPage(button) {
      button_click.play()
      this.currentPage = []
      for(let i = (this.perPage*this.page); i < (this.page + 1)*this.perPage; i++) {
        if(this.leaderboard[i] === undefined) {
          break;
        }
        this.currentPage.push(this.leaderboard[i])
      }
      this.page++
      if(this.leaderboard.at(-1) === this.currentPage.at(-1)) {
        button.path[1].children[1].setAttribute("class", "btn btn-disabled")
      }
      if(button.path[1].children[0].className.includes("disabled")) {
        button.path[1].children[0].setAttribute("class", "btn mr-5")
      }
    },
    previousPage(button) {
      button_click.play()
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
        button.path[1].children[0].setAttribute("class", "btn mr-5 btn-disabled")
      }
      if(button.path[1].children[1].className.includes("disabled")) {
        button.path[1].children[1].setAttribute("class", "btn")
      }
    }
  },
  sockets: {
    leaderboard(res) {
      console.log(res)
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
button {
  color: white;
  background-color: #1F1E1E;
}

@media only screen and (max-width: 900px) {
  .main-div {
    padding-right: 1rem;
    padding-left: 1rem;
  }
}
</style>