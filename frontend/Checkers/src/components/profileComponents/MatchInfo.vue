<template>
<div class="overflow-hidden">
  <table class="table table-compact w-full">

    <thead>
      <tr>
        <th>Game</th> 
        <th>Vincitore</th> 
        <th>Perdente</th>
        <th>Durata</th>
      </tr>
    </thead>

    <tbody>
      <template v-for="(user, i) in this.currentPage" :key="i">
        <tr>
          <th :textContent="'#' + ((this.history.indexOf(this.currentPage[i]))+1) "></th>
          <td>
            <div class="flex items-center space-x-3">
              <div class="avatar">
                <div class="w-12 h-12 mask mask-squircle">
                  <img v-bind:src="getAvatar(user.winner)" alt="Avatar Tailwind CSS Component">
                </div>
              </div> 
              <div>
                  <div class="font-bold">
                      {{ user.winner.username }}
                  </div> 
                  <div class="text-sm opacity-50">
                      {{ user.winner.mail }}
                  </div>
              </div>
            </div>
          </td>
          <td>
            <div class="flex items-center space-x-3">
              <div class="avatar">
                <div class="w-12 h-12 mask mask-squircle">
                  <img v-bind:src="getAvatar(user.loser)" alt="Avatar Tailwind CSS Component">
                </div>
              </div> 
              <div>
                  <div class="font-bold">
                      {{ user.loser.username }}
                  </div> 
                  <div class="text-sm opacity-50">
                       {{ user.loser.mail }}
                  </div>
              </div>
            </div>
          </td>
          <td>Durata</td>
        </tr>
      </template>
    </tbody>

  </table>

  <div v-if="this.history.length > this.perPage" class="flex mt-3 justify-center">
    <button @click="previousPage($event)" class="btn mr-5 btn-disabled">Previous</button> 
    <button @click="nextPage($event)" class="btn">Next</button>
  </div>
  <div v-else class="btn-group mt-4">
    <button @click="previousPage($event)" class="btn mr-5 btn-disabled ">Previous</button> 
    <button @click="nextPage($event)" class="btn btn-disabled">Next</button>
  </div>

</div>
</template>

<script>
import api from '@/../api.js'

export default {
  name: "HistoryInfo",
  props: ['socket'],
  data() {
    api.get_history(this.$socket)

    return {
      history: [],
      currentPage: [],
      perPage: 9,
      page: 1
    }
  },
  methods: {
    nextPage(button) {
      this.currentPage = []
      for(let i = (this.perPage*this.page); i < (this.page + 1)*this.perPage; i++) {
        if(this.history[i] === undefined) {
          break;
        }
        this.currentPage.push(this.history[i])
      }
      this.page++
      if(this.history.at(-1) === this.currentPage.at(-1)) {
        button.path[1].children[1].setAttribute("class", "btn btn-disabled")
      }
      if(button.path[1].children[0].className.includes("disabled")) {
        button.path[1].children[0].setAttribute("class", "btn mr-5")
      }
    },
    previousPage(button) {
      this.currentPage = []
      var fillTo = ((this.perPage*this.page)-1) - this.perPage
      for(let i = (fillTo - this.perPage)+1; i <= fillTo; i++) {
        if(this.history[i] === undefined) {
          break;
        }
        this.currentPage.push(this.history[i])
      }
      this.page--
      if(this.history[0] === this.currentPage[0]) {
        button.path[1].children[0].setAttribute("class", "btn mr-5 btn-disabled")
      }
      if(button.path[1].children[1].className.includes("disabled")) {
        button.path[1].children[1].setAttribute("class", "btn")
      }
    },
    getAvatar(user){
      if(user.avatar == ""){
        return "http://daisyui.com/tailwind-css-component-profile-1@40w.png"
      }else{
        return user.avatar
      } 
    }
  },
  sockets: {
    user_history(res) {
      this.history = res
      console.log(this.history)
      for(let i = 0; i < this.perPage; i++) {
        if(this.history[i] === undefined) {
          break;
        }
        this.currentPage.push(this.history[i])
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
</style>