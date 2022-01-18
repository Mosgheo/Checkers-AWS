<template>
<div class="overflow-x-auto">
  <table class="table w-full">

    <thead>
      <tr>
        <th>Game</th> 
        <th>Vincitore</th> 
        <th>Perdente</th>
        <th>Durata</th>
      </tr>
    </thead>

    <tbody>
      <template v-for="(user, i) in this.history" :key="i">
        <tr>
          <th :textContent="'#' + (i+1)"></th>
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
      history: null
    }
  },
  sockets: {
    user_history(res) {
      this.history = res
    }
  },
  methods:{
    getAvatar(user){
      if(user.avatar == ""){
        return "http://daisyui.com/tailwind-css-component-profile-1@40w.png"
      }else{
        return user.avatar
      } 
    }
  }
}
</script>


<style>
</style>