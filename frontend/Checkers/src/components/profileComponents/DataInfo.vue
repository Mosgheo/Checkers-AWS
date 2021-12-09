<template>
  <div class="form-control">

    <label class="label">
      <span class="label-text">Nome utente</span>
    </label> 
    <input type="text" placeholder="Username" v-bind:value="getUsername" class="username input input-bordered w-13">
    
    <label class="label mt-3">
      <span class="label-text">Nome</span>
    </label> 
    <input type="text" placeholder="Nome" class="first_name input input-bordered">

    <label class="label mt-3">
      <span class="label-text">Cognome</span>
    </label> 
    <input type="text" placeholder="Cognome" class="last_name input input-bordered">

    
    <label class="label mt-3">
      <span class="label-text">Email</span>
    </label> 
    <input type="text" placeholder="info@site.com" v-bind:value="getMail" class="mail input input-bordered">

    <select class="select select-bordered w-full max-w-xs mt-10">
      <option disabled="disabled" selected="selected">Selezione Località</option> 
      <option>Los Angeles</option> 
      <option>New York</option> 
      <option>Bologna</option>
    </select>

    <div class="object-center space-x-2 mt-10">
      <label class="btn" @click.prevent="save_profile">Salva</label> 
      <div class="update-modal modal modal-close">
          <div class="modal-box">
              <p class="msg">Ciao</p> 
              <div class="modal-action">
                  <label class="btn" @click.prevent="close">Accept</label>
              </div>
          </div>
      </div>
    </div>
    
  </div> 
</template>

<script>
import store from '@/store'
import api from '@/../api.js'

var user = null
var update_modal = document.getElementsByClassName("update-modal")
var msg = document.getElementsByClassName("msg")

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
      if(user.mail !== "") {
        return "" + user.mail
      }
      return "info@site.com"
    }
  },
  methods:{
    save_profile() {
      const user = {
          username : document.getElementsByClassName("username")[0].value,
          first_name : document.getElementsByClassName("first_name")[0].value,
          last_name : document.getElementsByClassName("last_name")[0].value,
          mail : document.getElementsByClassName("mail")[0].value
      }
      //TODO UPDATE STATE.USER AND SEND UPDATE TO BACKEND
      api.update_profile(this.$socket, user, localStorage.token)
    },
    close() {
        update_modal[0].setAttribute("class", "update-modal modal modal-close")
        this.$forceUpdate()
    }
  },
  sockets:{
    updated_user(user) {
      console.log(user)
      msg[0].textContent = "Update successful"
      update_modal[0].setAttribute("class", "update-modal modal modal-open")
      store.commit('setUser',user)
    },
    permit_error(err) {
      console.log(err)
      msg[0].textContent = err
      update_modal[0].setAttribute("class", "update-modal modal modal-open")
    },
    token_error(err) {
      console.log(err)
      msg[0].textContent = err
      update_modal[0].setAttribute("class", "update-modal modal modal-open")
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

