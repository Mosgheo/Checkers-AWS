<template>
  <div class="main-div flex flex-row items-center justify-center centralSpace px-28 py-5">

    <img src="@/assets/checkers.png" class="main-logo self-center mask min-w-fit min-h-fit w-7/12 h-7/12 mask-square">

    <div class="card items-center w-64 flex flex-col rightMenu self-center ml-10">
      <h1 class="font-bold text-2xl my-5">Gioca a Checkers</h1>
      <figure>
        <img src="@/assets/logo.png" class="self-center mask w-44 h-44 mt-2 p-2 mask-square">
      </figure> 

      <label @click="buttonClick" for="create-lobby-modal" id="btn-menu" class="btn text-sm">Crea Lobby</label>
      <input type="checkbox" id="create-lobby-modal" class="modal-toggle"> 
      <div class="modal">
        <div class="modal-box">
          <div class="form-control items-center">
            <label class="mt-3">
              <span class="font-bold text-lg">Dai un nome alla tua lobby</span>
            </label> 
            <input type="text" placeholder="Name" class="text-base input-name input input-bordered mt-2 w-min">
            <label class="font-bold text-lg mt-3">
              <span>Indica il punteggio massimo che deve avere un giocatore</span>
            </label> 
            <input type="text" placeholder="Max Points" class="text-base input-star input input-bordered mt-2 w-min">
          </div>
          <div class="flex flex-row modal-action">
            <label for="create-lobby-modal" @click="startingMatch" class="accept btn"> 
              Avvia creazione
            </label>
            <label for="create-lobby-modal" @click="buttonClick" class="btn">Annulla</label>
          </div>
        </div>
      </div>

      <label @click="buttonClick" for="join-lobby-modal" id="btn-menu" class="btn text-sm">Unisciti ad una lobby</label>
      <input type="checkbox" id="join-lobby-modal" class="modal-toggle"> 
      <div class="modal">
        <div class="modal-box items-center">
          <div class="form-control items-center">
            <label class="mt-3">
              <span class="font-bold text-lg">Indica il punteggio massimo delle lobby</span>
            </label> 
            <input type="text" placeholder="Max Points" class="input-star2 input input-bordered mt-2 w-min">
          </div>
          <div class="flex flex-row modal-action">
            <label @click="lobbyOpened" for="join-lobby-modal" class="accept btn">
              Cerca lobby
            </label>
            <label @click="buttonClick" for="join-lobby-modal" class="btn">Annulla</label>
          </div>
        </div>
      </div>

      <label @click="buttonClick" for="friends-modal" id="btn-menu" class="btn mb-7 text-sm">Sfida un amico</label>
      <input type="checkbox" id="friends-modal" class="modal-toggle"> 
      <div class="modal modal-invite">
        <div class="modal-box items-center"> 
          <h3 class="font-bold text-lg">Inserisci il nickname del tuo amico</h3>
          <div class="form-control items-center mt-2">
            <input type="text" placeholder="Username" class="text-base opponent-mail input input-bordered w-min">
          </div>
          <div class="flex flex-row modal-action">
            <label @click="invitePlayer" for="friends-modal" class="accept btn">Invita</label>
            <label @click="buttonClick" for="friends-modal" class="btn">Annulla</label>
          </div>
        </div>
      </div>
    </div>

    <div class="dropdown mt-10">
      <div tabindex="0" @click="buttonClick" class="flex flex-nowrap flex-column btn h-24">
        <figure>
          <img src="@/assets/logo.png" class="checkers-img self-center mask w-20 h-20 mask-square">
        </figure> 
        <h1 class="play-checkers font-bold text-2xl">Gioca a Checkers</h1>
      </div> 
      <ul tabindex="0" class="p-2 menu dropdown-content bg-base-100 rounded-box w-52">
        <li class="mt-3">
          <label @click="buttonClick" for="create-lobby-modal" id="btn-menu" class="btn text-sm">Crea Lobby</label>
          <input type="checkbox" id="create-lobby-modal" class="modal-toggle"> 
          <div class="modal">
            <div class="modal-box">
              <div class="form-control items-center">
                <label class="mt-3">
                  <span class="font-bold text-lg">Dai un nome alla tua lobby</span>
                </label> 
                <input type="text" placeholder="Name" class="text-base input-name input input-bordered mt-2 w-min">
                <label class="font-bold text-lg mt-3">
                  <span>Indica il punteggio massimo che deve avere un giocatore</span>
                </label> 
                <input type="text" placeholder="Max Points" class="text-base input-star input input-bordered mt-2 w-min">
              </div>
              <div class="flex flex-row modal-action">
                <label for="create-lobby-modal" @click="startingMatch" class="accept btn"> 
                  Avvia creazione
                </label>
                <label for="create-lobby-modal" @click="buttonClick" class="btn">Annulla</label>
              </div>
            </div>
          </div>
        </li> 
        <li class="mt-3">
          <label @click="buttonClick" for="join-lobby-modal" id="btn-menu" class="btn text-sm">Unisciti ad una lobby</label>
          <input type="checkbox" id="join-lobby-modal" class="modal-toggle"> 
          <div class="modal">
            <div class="modal-box items-center">
              <div class="form-control items-center">
                <label class="mt-3">
                  <span class="font-bold text-lg">Indica il punteggio massimo delle lobby</span>
                </label> 
                <input type="text" placeholder="Max Points" class="input-star2 input input-bordered mt-2 w-min">
              </div>
              <div class="flex flex-row modal-action">
                <label @click="lobbyOpened" for="join-lobby-modal" class="accept btn">
                  Cerca lobby
                </label>
                <label @click="buttonClick" for="join-lobby-modal" class="btn">Annulla</label>
              </div>
            </div>
          </div>
        </li> 
        <li class="mt-3">
          <label @click="buttonClick" for="friends-modal" id="btn-menu" class="btn mb-7 text-sm">Sfida un amico</label>
          <input type="checkbox" id="friends-modal" class="modal-toggle"> 
          <div class="modal modal-invite">
            <div class="modal-box items-center"> 
              <h3 class="font-bold text-lg">Inserisci il nickname del tuo amico</h3>
              <div class="form-control items-center mt-2">
                <input type="text" placeholder="Username" class="text-base opponent-mail input input-bordered w-min">
              </div>
              <div class="flex flex-row modal-action">
                <label @click="invitePlayer" for="friends-modal" class="accept btn">Invita</label>
                <label @click="buttonClick" for="friends-modal" class="btn">Annulla</label>
              </div>
            </div>
          </div>
        </li>
      </ul>
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
</template>

<script>
import api from '../../api.js'
import store from '../store'

var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

var lobbyName = document.getElementsByClassName("input-name")
var starTextBox = document.getElementsByClassName("input-star")
var starTextBox2 = document.getElementsByClassName("input-star2")
var opponent = document.getElementsByClassName("opponent-mail")

export default {
  name: 'Home',
  methods: {
    startingMatch() {
      button_click.play()
      if(store.state.token !== "") {
        api.build_lobby(this.$socket, lobbyName[0].value, starTextBox[0].value)
        this.$router.push("/inGame")
      } else {
        this.$router.push("/404")
      }
    },
    lobbyOpened() {
      button_click.play()
      if(store.state.token !== "") {
        api.get_lobbies(this.$socket, starTextBox2[0].value)
        this.$router.push("/lobbies")
      } else {
        this.$router.push("/404")
      }
    },
    invitePlayer() {
      button_click.play()
      if(store.state.token !== "") {
        api.invite_opponent(this.$socket, opponent[0].value)
        /*console.log(document.getElementsByClassName("alert-info"))
        document.getElementsByClassName("alert-info")[0].style.visibility = "visible"
        setTimeout(function() {
          console.log("Ciao")
          console.log(document.getElementsByClassName("alert-info"))
          //document.getElementsByClassName("alert-info")[0].style.visibility = "hidden"
        }, 3000)*/
        //this.$router.push("/profile")
      } else {
        this.$router.push("/404")
      }
    },
    buttonClick() {
      button_click.play()
    }
  }
}
</script>

<style scoped>
.main-logo {
  min-width: 35rem;
  min-height: 35rem;
}
.rightMenu {
  min-width: 250px;
  background-color: #1F1E1E;
}
.rightMenu #btn-menu:first-child {
  margin-top: 6.8em;
}
.rightMenu #btn-menu {
  margin-top: 4em;
  width: 200px;
  margin-left: 1.5em;
  margin-right: 1.5em;
}
.modal-box {
  background-color: #343232;
}
.dropdown {
  visibility: hidden;
}

@media only screen and (max-width: 1200px) {
  .main-div {
    flex-direction: column;
  }
  .rightMenu {
    visibility: hidden;
    width: 0;
    height: 0;
  }
  .dropdown {
    visibility: visible;
  }
  .main-logo {
    min-width: 30rem;
    min-height: 30rem;
  }
  .play-checkers {
    margin-left: 0.8rem;
  }
  .checkers-img {
    min-width: 5rem;
    min-height: 5rem;
  }
}
</style>