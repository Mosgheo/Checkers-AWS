<template>
<div>
  <div class="flex flex-row content-center centralSpace">
    <Checkerboard class="flex flex-col board"/>

    <div class="card items-center w-64 flex flex-col rightMenu">
      <h1 class="mt-5">Gioca a Checkers</h1>
      <figure>
        <img src="@/assets/logo.png" class="mask w-44 h-44 mt-2 p-2">
      </figure> 

      <label for="create-lobby-modal" id="btn-menu" class="btn">Gioca Online</label>
      <input type="checkbox" id="create-lobby-modal" class="modal-toggle"> 
      <div class="online-modal modal">
        <div class="modal-box">
          <h3>Cerca una partita contro un avversario online del tuo livello</h3>
          <select class="select select-bordered mt-2 select-lg w-full max-w-xs">
            <option selected="selected">10min</option> 
            <option>5min</option> 
            <option>30min</option>
          </select> 
          <div class="flex flex-row modal-action">
            <label for="create-lobby-modal" @click="startingMatch" class="accept btn">Avvia ricerca</label> 
            <label for="create-lobby-modal" class="btn">Annulla</label>
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
            <label for="cpu-modal" class="btn">Avvia</label> 
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
            <input type="text" class="input input-bordered w-min">
          </div>
          <div class="modal-action">
            <label for="friends-modal" class="btn">Invita</label> 
            <label for="friends-modal" class="btn">Annulla</label>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
</template>

<script>
import Checkerboard from '@/components/boardComponents/Checkerboard'
var startingMatchButton = document.getElementsByClassName("accept")[0]
var onlineModal = document.getElementsByClassName("online-modal")[0]
//import Chat from '@/components/boardComponents/Chat'
//import api from '../../api.js'

export default {
  name: 'Home',
  components: {
    Checkerboard
  },
  methods: {
    startingMatch() {
      startingMatchButton.setAttribute("class", "accept btn loading")
      onlineModal.setAttribute("class", "online-modal m")
    }
  }
}
</script>

<style scoped>
.centralSpace{
  padding: 1em 0em 0.6em 20em
}
.rightMenu {
  margin-right: 10rem;
  margin-left: 2em;
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
  .rightMenu #btn-menu {
    min-width: 130px;
    margin-top: 2em;
  }
  .board {
    margin-left: 1em;
  }
}

@media (max-width: 850px) {
  .board {
    margin-left: 0.8em;
  }
} 
</style>