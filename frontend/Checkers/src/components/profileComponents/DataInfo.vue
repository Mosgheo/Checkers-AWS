<template>
  <div class="form-control">

    <label class="label">
      <span class="label-text">Nome utente</span>
    </label> 
    <input type="text" placeholder="Username" v-bind:value="getUsername" class="input input-bordered w-13">
    
    <label class="label mt-3">
      <span class="label-text">Nome</span>
    </label> 
    <input type="text" placeholder="Nome" class="input input-bordered">

    <label class="label mt-3">
      <span class="label-text">Cognome</span>
    </label> 
    <input type="text" placeholder="Cognome" class="input input-bordered">

    
    <label class="label mt-3">
      <span class="label-text">Email</span>
    </label> 
    <input type="text" placeholder="info@site.com" v-bind:value="getMail" class="input input-bordered">

    <select class="select select-bordered w-full max-w-xs mt-10">
      <option disabled="disabled" selected="selected">Selezione Località</option> 
      <option>Los Angeles</option> 
      <option>New York</option> 
      <option>Bologna</option>
    </select>

    <div class="object-center space-x-2 mt-10">
      <button class="btn" @click.prevent="save_profile()">Salva</button>
    </div>
  </div> 
</template>

<script>
import store from '@/store'
import api from '@/../api.js'

var user = null

export default {
  name: "UserInfo",
  setup() {
    user = store.getters.user
  },
  computed: {
    getUsername() {
      if(user.username !== "") {
        return "" + user.username
      }
      return "Username"
    },
    getMail() {
      if(user.email !== "") {
        return "" + user.email
      }
      return "info@site.com"
    }
  },
  methods:{
    save_profile(username,first_name,last_name,email){
      const user = {
              username : username,
              firstname : first_name,
              last_name : last_name,
              email : email
      }
      //TODO UPDATE STATE.USER AND SEND UPDATE TO BACKEND
      api.update_profile(this.$socket,user)
    }
  },
  sockets:{
    updated_user(user){
      //USER UPDATED
      store.commit('setUser',user)
    },
    permit_error(err){
      //Something went wrong with mongoDB or something unpredictable
    },
    socket_error(err){
      //SOmething went wrong while authenticatig
    }
  }

}
</script>

<style scoped>
span {
  color: #CDCBCB;
}
input {
  max-width: 400px;
  background-color: #343232;
}
.select {
  background-color: #343232;
}
</style>

