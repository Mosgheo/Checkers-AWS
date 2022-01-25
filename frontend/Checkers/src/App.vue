<template>
<div id="app">

  <div v-if="this.screenWidth > 1250" class="flex flex-row">
    <Sidebar @checkInvite="checkInvite" class="sidebar min-h-screen" :invites="this.invites" />
    <div class="middle w-screen min-h-screen">
      <router-view />
    </div>
  </div>

  <div v-else class="flex flex-col max-h-screen">
    <Sidebar @checkInvite="checkInvite" class="sidebar min-w-screen" :invites="this.invites" />
    <div class="middle min-w-screen h-screen">
      <router-view />
    </div>
  </div>

  <div class="modal modal-notifications">
    <div class="modal-box">
      <p class="notification-msg"></p> 
      <div class="modal-action">
        <label for="my-modal-2" @click="accept" class="btn">Accept</label> 
        <label for="my-modal-2" @click="decline" class="btn">Refuse</label>
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
      screenWidth: window.innerWidth,
      invites: [],
      inviteId: null
    }
  },
  methods: {
    accept() {
      console.log(store.state.in_game)
      if(!store.state.in_game) {
        api.accept_invite(this.$socket, this.opponent_mail)
        this.invites.splice(this.inviteId, 1)
        this.$router.push("/inGame")
      }
      modal[0].className = "modal modal-notifications modal-close"
    },
    decline() {
      api.decline_invite(this.$socket, this.opponent_mail)
      this.invites.splice(this.inviteId, 1)
      modal[0].className = "modal modal-notifications modal-close"
    },
    resizeHandler() {
      this.screenWidth = window.innerWidth
      this.$forceUpdate()
    },
    checkInvite(invite, i) {
      this.opponent_mail = invite
      this.inviteId = i
      if(!store.state.in_game) {
        message[0].innerHTML = "Hai ricevuto una sfida da parte di: " + invite
      } else {
        message[0].innerHTML = "Non puoi entrare in un'altra lobby mentre sei già in partita"
      }
      modal[0].className = "modal modal-notifications modal-open"
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
      for(let i = 0; i < this.invites.length; i++) {
        if(this.invites[i] === msg) {
          this.invites[i] = msg
          return
        }
      }
      this.invites.push(msg)
    },
    invite_accepted() {
      console.log("Invite accepated")
      console.log(store.state.in_game)
      if(!store.state.in_game) {
        this.$router.push("/inGame")
      }
    },
    invitation_declined(msg) {
      console.log(msg)
    },
    invitation_expired(msg) {
      message[0].innerHTML = msg
      modal[0].className = "modal modal-notifications modal-open"
      this.$router.push("/")
    }
  }
}
</script>

<style>
#app {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-style: italic;
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
  text-align: center;
  color: #A39D8F;
}

.middle {
  background-color: #343232;
}
</style>
