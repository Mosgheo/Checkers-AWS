<template>
<div>
  <div class="flex flex-row centralSpace">

    <div class="card items-center w-64 flex flex-col rightMenu">
      <h1 class="mt-5">Gioca a Checkers</h1>
      <figure>
        <img src="@/assets/logo.png" class="mask w-44 h-44 mt-2 p-2">
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

      <label for="cpu-modal" id="btn-menu" class="btn">Computer</label>
      <input type="checkbox" id="cpu-modal" class="modal-toggle"> 
      <div class="modal">
        <div class="modal-box">
          <h3>Sfida il Computer alla difficoltà che preferisci</h3>
          <select class="select select-bordered mt-2 select-lg w-full max-w-xs">
            <option selected="selected">Facile</option> 
            <option>Medio</option> 
            <option>Difficile</option>
          </select> 
          <div class="modal-action">
            <router-link to="/inGame"> <label for="cpu-modal" class="btn">Avvia</label> </router-link>
            <label for="cpu-modal" class="btn">Annulla</label>
          </div>
        </div>
      </div>

      <label for="friends-modal" id="btn-menu" class="btn">Sfida un amico</label>
      <input type="checkbox" id="friends-modal" class="modal-toggle"> 
      <div class="modal">
        <div class="modal-box"> 
          <h3>Inserisci il nickname del tuo amico</h3>
          <div class="form-control items-center mt-2">
            <input type="text" placeholder="Username" class="input input-bordered w-min">
          </div>
          <div class="modal-action">
            <router-link to="/inGame"> <label for="friends-modal" class="btn">Invita</label> </router-link>
            <label for="friends-modal" class="btn">Annulla</label>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
</template>

<script>
//import Checkerboard from '@/components/boardComponents/Checkerboard'
import api from '../../api.js'
import store from '../store'
var lobbyName = document.getElementsByClassName("input-name")
var starTextBox = document.getElementsByClassName("input-star")
var starTextBox2 = document.getElementsByClassName("input-star2")

export default {
  name: 'Home',
  components: {
    //Checkerboard
  },
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
    }
  },
  sockets: {
    lobbies(res) {
      console.log(res)
    },
    token_ok(res){
      store.commit('setToken',res.token)
      sessionStorage.token = res.token
      store.commit('setUser',res.user)
      console.log(JSON.stringify(res.user))
      ///var tokenData = JSON.parse(Buffer.from(res.token.split('.')[1], 'base64'))
      ///token_timeout(tokenData);
    },
    token_error(res){
      console.log("something wrong with tokens boy")
      sessionStorage.token = ""
      store.commit('unsetToken')
    }
  }
}
</script>

<style>
.centralSpace{
  padding: 1em 0em 0.6em 11em;
  margin-left: 10em
}
</style>

<style scoped>
.rightMenu {
  margin-right: 10rem;
  background-color: #1F1E1E;
}
.rightMenu #btn-menu:first-child {
  margin-top: 6.8em;
}
.rightMenu #btn-menu {
  margin-top: 4em;
  width: 205px;
  margin-left: 1.5em;
  margin-right: 1.5em;
}
.modal-box {
  background-color: #343232;
}
@media (max-width: 1700px) {
  .rightMenu {
    margin-left: 2em;
  }
  .rightMenu #btn-menu {
    min-width: 130px;
    margin-top: 2em;
  }
}
</style>