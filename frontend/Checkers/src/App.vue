<template>
  <div id="app">

    <div v-if="this.screenWidth > 1000">
      <div class="flex flex-row">
        <Sidebar class="sidebar min-h-screen" />
        <div class="middle w-screen min-h-screen">
          <router-view />
        </div>
      </div>

      <div class="modal modal-notifications">
        <div class="modal-box">
          <p class="notification-msg"></p> 
          <div class="modal-action">
            <label for="my-modal-2" @click="accept" class="btn">Accept</label> 
            <label for="my-modal-2" @click="decline" class="btn">Close</label>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="flex flex-col max-h-screen">
        <Sidebar class="sidebar min-w-screen" />
        <div class="middle min-w-screen h-screen">
          <router-view />
        </div>
      </div>

      <div class="modal modal-notifications">
        <div class="modal-box">
          <p class="notification-msg"></p> 
          <div class="modal-action">
            <label for="my-modal-2" @click="accept" class="btn">Accept</label> 
            <label for="my-modal-2" @click="decline" class="btn">Rifiuta</label>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import Sidebar from '@/components/sidebarComponents/Sidebar.vue'
import store from './store'
import api from '../api.js'

var message = document.getElementsByClassName("notification-msg")
var modal = document.getElementsByClassName("modal-notifications")

export default {
  components: {
    Sidebar
  },
  created()  {
    window.addEventListener("resize", this.resizeHandler);
  },

  destroyed()  {
    window.removeEventListener("resize", this.resizeHandler);
  },
  data() {
    return {
      opponent_mail: null,
      screenWidth: window.innerWidth
    }
  },
  methods: {
    accept() {
      api.accept_invite(this.$socket, this.opponent_mail)
      modal[0].className = "modal modal-notifications modal-close"
      this.$router.push("/inGame")
    },
    decline() {
      api.decline_invite(this.$socket, this.opponent_mail)
      modal[0].className = "modal modal-notifications modal-close"
    },
    resizeHandler() {
      this.screenWidth = window.innerWidth
    }
  },
  sockets: {
    token_ok(res){
      store.commit('setToken',res.token)
      sessionStorage.token = res.token
      store.commit('setUser',res.user)
      console.log("got a fresh new token for ya")
      ///var tokenData = JSON.parse(Buffer.from(res.token.split('.')[1], 'base64'))
      ///token_timeout(tokenData);
    },
    token_error(res){
      console.log("something wrong with tokens boy")
      sessionStorage.token = ""
      store.commit('unsetToken')
    },
    permit_error(error) {
      console.log(error)
    },
    server_error(error) {
      console.log(error)
    },
    lobby_deleted(msg) {
      console.log(msg)
    },
    lobby_invitation(msg) {
      console.log(msg)
      this.opponent_mail = msg
      message[0].innerHTML = "Hai ricevuto una sfida da parte di: "
      modal[0].className = "modal modal-notifications modal-open"
    },
    invite_accepted() {
      console.log("Invite accepated")
      this.$router.push("/inGame")
    },
    invitation_declined(msg) {
      console.log(msg)
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 18px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #A39D8F;
}

.middle {
  background-color: #343232;
}
</style>
