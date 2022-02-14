<!-- This is the Home component -->

<template>
  <div class="main-div flex flex-row items-center justify-center centralSpace px-28 py-5">

    <img src="@/assets/checkers.png" alt="Main Logo" class="main-logo self-center mask min-w-fit min-h-fit w-7/12 h-7/12 mask-square">

    <div class="card items-center w-64 flex flex-col rightMenu self-center ml-10">
      <h1 class="font-bold text-2xl my-5">Play Checkers</h1>
      <figure>
        <img src="@/assets/logo.png" alt="menù-logo" class="self-center mask w-44 h-44 mt-2 p-2 mask-square">
      </figure> 

      <label @click="buttonClick" for="create-lobby-modal" id="btn-menu" class="btn text-sm">Create a new lobby</label>
      <input type="checkbox" id="create-lobby-modal" class="modal-toggle"> 
      <div class="modal">
        <div class="modal-box flex flex-col items-center">
          <img alt="Modal Logo Image" class="w-40 h-28" src="@/assets/msg_image.png" />
          <div class="form-control items-center">
            <label class="mt-3">
              <span class="font-bold text-lg">Give a name to your lobby</span>
            </label> 
            <input type="text" placeholder="Name" class="text-base input-name input input-bordered mt-2 w-min">
            <label class="font-bold text-lg mt-3">
              <span>Max stars for this lobby</span>
            </label> 
            <input type="text" placeholder="Max Points" class="text-base input-star input input-bordered mt-2 w-min">
          </div>
          <div class="flex flex-row modal-action">
            <label for="create-lobby-modal" @click="startingMatch" class="accept btn"> 
              Create
            </label>
            <label for="create-lobby-modal" @click="buttonClick" class="btn">Cancel</label>
          </div>
        </div>
      </div>

      <label @click="lobbyOpened" for="join-lobby-modal" id="btn-menu" class="btn text-sm">Join a lobby</label>

      <label @click="buttonClick" for="friends-modal" id="btn-menu" class="btn mb-7 text-sm">Invite a player</label>
      <input type="checkbox" id="friends-modal" class="modal-toggle"> 
      <div class="modal modal-invite">
        <div class="flex flex-col modal-box items-center">
          <img alt="Modal Logo Image" class="w-40 h-28" src="@/assets/msg_image.png" />
          <h3 class="font-bold text-lg">Insert mail of the player</h3>
          <div class="form-control items-center mt-2">
            <input type="text" placeholder="Mail" class="text-base opponent-mail input input-bordered w-min">
          </div>
          <div class="flex flex-row modal-action">
            <label @click="invitePlayer" for="friends-modal" class="accept btn">Send</label>
            <label @click="buttonClick" for="friends-modal" class="btn">Cancel</label>
          </div>
        </div>
      </div>
    </div>

    <div class="dropdown mt-10">
      <div tabindex="0" @click="buttonClick" class="flex flex-nowrap flex-column btn h-24">
        <figure>
          <img alt="Modal Logo Image" src="@/assets/logo.png" class="checkers-img self-center mask w-20 h-20 mask-square">
        </figure> 
        <h1 class="play-checkers font-bold text-2xl">Play Checkers</h1>
      </div> 
      <ul tabindex="0" class="p-2 menu dropdown-content bg-base-100 rounded-box w-52">
        <li class="mt-3">
          <label @click="buttonClick" for="create-lobby-modal" id="btn-menu" class="btn text-sm">Create a new Lobby</label>
          <input type="checkbox" id="create-lobby-modal" class="modal-toggle"> 
          <div class="modal">
            <div class="flex flex-col items-center modal-box">
              <img alt="Modal Logo Image" class="w-40 h-28" src="@/assets/msg_image.png" />
              <div class="form-control items-center">
                <label class="mt-3">
                  <span class="font-bold text-lg">Give a name to your lobby</span>
                </label> 
                <input type="text" placeholder="Name" class="text-base input-name input input-bordered mt-2 w-min">
                <label class="font-bold text-lg mt-3">
                  <span>Max stars for this lobby</span>
                </label> 
                <input type="text" placeholder="Max Points" class="text-base input-star input input-bordered mt-2 w-min">
              </div>
              <div class="flex flex-row modal-action">
                <label for="create-lobby-modal" @click="startingMatch" class="accept btn"> 
                  Create
                </label>
                <label for="create-lobby-modal" @click="buttonClick" class="btn">Cancel</label>
              </div>
            </div>
          </div>
        </li> 
        <li class="mt-3">
          <label @click="lobbyOpened" for="join-lobby-modal" id="btn-menu" class="btn text-sm">Join a lobby</label>
        </li> 
        <li class="mt-3">
          <label @click="buttonClick" for="friends-modal" id="btn-menu" class="btn mb-7 text-sm">Invite a player</label>
          <input type="checkbox" id="friends-modal" class="modal-toggle"> 
          <div class="modal modal-invite">
            <div class="flex flex-col modal-box items-center"> 
              <img alt="Modal Logo Image" class="w-40 h-28" src="@/assets/msg_image.png" />
              <h3 class="font-bold text-lg">Insert mail of the player</h3>
              <div class="form-control items-center mt-2">
                <input type="text" placeholder="Mail" class="text-base opponent-mail input input-bordered w-min">
              </div>
              <div class="flex flex-row modal-action">
                <label @click="invitePlayer" for="friends-modal" class="accept btn">Send</label>
                <label @click="buttonClick" for="friends-modal" class="btn">Cancel</label>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import api from '../../api.js'
import store from '../store'
import { getCurrentInstance } from 'vue'

var appInstance = null

var lobbyName = document.getElementsByClassName("input-name")
var starTextBox = document.getElementsByClassName("input-star")
var starTextBox2 = document.getElementsByClassName("input-star2")
var opponent = document.getElementsByClassName("opponent-mail")

export default {
  name: 'Home',
  setup() {
    appInstance = getCurrentInstance().appContext.config.globalProperties
  },
  methods: {
    // Build a new lobby with a name and max stars
    startingMatch() {
      this.buttonClick()
      if(store.state.token !== "") {
        api.build_lobby(this.$socket, lobbyName[0].value, starTextBox[0].value)
        this.$router.push("/inGame")
      } else {
        this.$router.push("/404")
      }
    },
    // Request all open lobbies that you can join
    lobbyOpened() {
      this.buttonClick()
      if(store.state.token !== "") {
        api.get_lobbies(this.$socket, store.getters.user.stars)
        this.$router.push("/lobbies")
      } else {
        this.$router.push("/404")
      }
    },
    // Invite a player using mail
    invitePlayer() {
      this.buttonClick()
      if(store.state.token !== "") {
        api.invite_opponent(this.$socket, opponent[0].value)
      } else {
        this.$router.push("/404")
      }
    },
    buttonClick() {
      appInstance.$BUTTON_CLICK.play()
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
    padding: 0;
    margin-top: 5rem;
  }
  .play-checkers {
    margin-left: 0.8rem;
  }
  .checkers-img {
    min-width: 5rem;
    min-height: 5rem;
  }
}

@media only screen and (max-width: 785px) { 
  .main-logo {
    min-width: 27rem;
    min-height: 27rem;
  }
}
</style>