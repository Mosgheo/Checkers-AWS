<template>
<div>
  <div class="flex flex-row items-center justify-center centralSpace px-28 py-7">

    <img src="@/assets/checkers.png" class="self-center mask min-w-fit min-h-fit w-7/12 h-7/12 mask-squircle">

    <div class="card items-center w-64 flex flex-col rightMenu self-center ml-10">
      <h1 class="mt-5">Gioca a Checkers</h1>
      <figure>
        <img src="@/assets/logo.png" class="self-center mask w-44 h-44 mt-2 p-2">
      </figure> 

      <label for="create-lobby-modal" id="btn-menu" class="btn">Crea Lobby</label>
      <input type="checkbox" id="create-lobby-modal" class="modal-toggle"> 
      <div class="modal">
        <div class="modal-box">
          <div class="form-control items-center">
            <label class="mt-3">
              <span>Dai un nome alla tua lobby</span>
            </label> 
            <input type="text" placeholder="Name" class="input-name input input-bordered mt-2 w-min">
            <label class="mt-3">
              <span>Indica il punteggio massimo che deve avere un giocatore</span>
            </label> 
            <input type="text" placeholder="Max Points" class="input-star input input-bordered mt-2 w-min">
          </div>
          <div class="flex flex-row modal-action">
            <label for="create-lobby-modal" @click.prevent="startingMatch" class="accept btn"> 
              Avvia creazione
            </label>
            <label for="create-lobby-modal" class="btn">Annulla</label>
          </div>
        </div>
      </div>

      <label for="join-lobby-modal" id="btn-menu" class="btn">Unisciti ad una lobby</label>
      <input type="checkbox" id="join-lobby-modal" class="modal-toggle"> 
      <div class="modal">
        <div class="modal-box items-center">
          <div class="form-control items-center">
            <label class="mt-3">
              <span>Indica il punteggio massimo delle lobby</span>
            </label> 
            <input type="text" placeholder="Max Points" class="input-star2 input input-bordered mt-2 w-min">
          </div>
          <div class="flex flex-row modal-action">
            <label @click.prevent="lobbyOpened" for="join-lobby-modal" class="accept btn">
              Cerca lobby
            </label>
            <label for="join-lobby-modal" class="btn">Annulla</label>
          </div>
        </div>
      </div>

      <label for="friends-modal" id="btn-menu" class="btn mb-7">Sfida un amico</label>
      <input type="checkbox" id="friends-modal" class="modal-toggle"> 
      <div class="modal modal-invite">
        <div class="modal-box items-center"> 
          <h3>Inserisci il nickname del tuo amico</h3>
          <div class="form-control items-center mt-2">
            <input type="text" placeholder="Username" class="opponent-mail input input-bordered w-min">
          </div>
          <div class="flex flex-row modal-action">
            <label @click.prevent="invitePlayer" for="friends-modal" class="accept btn">Invita</label>
            <label for="friends-modal" class="btn">Annulla</label>
          </div>
        </div>
      </div>

    </div>

    <div class="alert alert-info" style="display: none">
      <div class="flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 mx-2 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>                          
        </svg> 
        <label>Invito mandato correttamente</label>
      </div>
    </div>

  </div>
</div>
</template>

<script>
import api from '../../api.js'
import store from '../store'
var lobbyName = document.getElementsByClassName("input-name")
var starTextBox = document.getElementsByClassName("input-star")
var starTextBox2 = document.getElementsByClassName("input-star2")
var opponent = document.getElementsByClassName("opponent-mail")

export default {
  name: 'Home',
  methods: {
    startingMatch() {
      if(store.state.token !== "") {
        api.build_lobby(this.$socket, lobbyName[0].value, starTextBox[0].value)
        this.$router.push("/inGame")
      }
    },
    lobbyOpened() {
      if(store.state.token !== "") {
        api.get_lobbies(this.$socket, starTextBox2[0].value)
        this.$router.push("/lobbies")
      }
    },
    invitePlayer() {
      if(store.state.token !== "") {
        api.invite_opponent(this.$socket, opponent[0].value)
        /*console.log(document.getElementsByClassName("alert-info"))
        document.getElementsByClassName("alert-info")[0].style.visibility = "visible"
        setTimeout(function() {
          console.log("Ciao")
          console.log(document.getElementsByClassName("alert-info"))
          //document.getElementsByClassName("alert-info")[0].style.visibility = "hidden"
        }, 3000)*/
        this.$router.push("/profile")
      }
    }
  }
}
</script>

<style scoped>
img {
  min-width: 55%;
  min-height: 55%;
}
.rightMenu {
  min-width: 230px;
  background-color: #1F1E1E;
}
.rightMenu #btn-menu:first-child {
  margin-top: 6.8em;
}
.rightMenu #btn-menu {
  margin-top: 4em;
  min-width: 205px;
  margin-left: 1.5em;
  margin-right: 1.5em;
}
.modal-box {
  background-color: #343232;
}
</style>