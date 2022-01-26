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

  <div class="modal modal-invites">
    <div class="modal-box">
      <p class="invites-msg"></p> 
      <div class="modal-action">
        <label @click="accept" class="btn">Accept</label> 
        <label @click="decline" class="btn">Refuse</label>
      </div>
    </div>
  </div>

  <div class="modal modal-notification">
    <div class="modal-box">
      <p class="notification-msg"></p> 
      <div class="modal-action">
        <label @click="close" class="btn">Accept</label>
      </div>
    </div>
  </div>

</div>
</template>

<script>
import Sidebar from '@/components/sidebarComponents/Sidebar.vue'
import store from './store'
import api from '../api.js'

var notification_sound = new Audio(require("@/assets/sounds/notification.mp3"))
var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

var message = document.getElementsByClassName("invites-msg")
var modal = document.getElementsByClassName("modal-invites")
var modalNotification = document.getElementsByClassName("modal-notification")
var messageNotification = document.getElementsByClassName("notification-msg")

export default {
  components: {
    Sidebar
  },
  created() {
    window.addEventListener("resize", this.resizeHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeHandler);
  },
  data() {
    return {
      opponent_mail: null,
      screenWidth: window.innerWidth,
      invites: [],
      inviteId: null,
      invitation_expired: false
    }
  },
  methods: {
    accept() {
      button_click.play()
      if(!store.state.in_game) {
        api.accept_invite(this.$socket, this.opponent_mail)
        this.invites.splice(this.inviteId, 1)
        var component = this
        setTimeout(function() {
          if(!component.invitation_expired) {
            console.log("Invito buono")
            component.$router.push("/inGame")
          } else {
            console.log("Invito scaduto")
            component.invitation_expired = false
          }
        }, 500)
      }
      modal[0].className = "modal modal-invites"
    },
    decline() {
      button_click.play()
      api.decline_invite(this.$socket, this.opponent_mail)
      this.invites.splice(this.inviteId, 1)
      modal[0].className = "modal modal-invites"
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
      modal[0].className = "modal modal-invites modal-open"
    },
    close() {
      button_click.play()
      modalNotification[0].className = "modal modal-notification"
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
    token_error(res) {
      console.log("something wrong with tokens boy")
      sessionStorage.token = ""
      store.commit('unsetToken')
      this.$router.push("/404")
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
      notification_sound.play()
    },
    invite_accepted() {
      var component = this
      if(!store.state.in_game) {
        component.$router.push("/inGame")
      }
    },
    invitation_declined(msg) {
      console.log(msg)
    },
    invitation_expired(msg) {
      this.invitation_expired = true
      console.log(msg)
      messageNotification[0].innerHTML = msg.message
      modalNotification[0].className = "modal modal-notification modal-open"
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
