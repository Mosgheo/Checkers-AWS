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
      <button class="btn">Salva</button>
    </div>
  </div> 
</template>

<script>
import store from '@/store'

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
      if(user.mail !== "") {
        return "" + user.mail
      }
      return "info@site.com"
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

