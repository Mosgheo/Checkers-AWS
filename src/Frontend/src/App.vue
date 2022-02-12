<template>
<div id="app">

  <div id="main" class="flex flex-row min-h-screen min-w-screen">
    <Sidebar @checkInvite="checkInvite" class="sidebar h-max" :invites="this.invites" />
    <div class="middle w-screen min-w-fit h-screen">
      <router-view />
    </div>
  </div>

  <div class="modal modal-invites">
    <div class="flex flex-col items-center modal-box">
      <img class="w-40 h-28" src="@/assets/msg_image.png" alt="logo-notification" />
      <p class="text-base font-semibold invites-msg"></p> 
      <div class="modal-action">
        <label @click="accept" class="btn">Accept</label> 
        <label @click="decline" class="btn">Refuse</label>
      </div>
    </div>
  </div>

  <div class="modal modal-notification">
    <div class="flex flex-col items-center modal-box">
      <img class="w-40 h-28" src="@/assets/msg_image.png" alt="logo-notification" />
      <p class="text-base font-semibold notification-msg"></p>
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
import { getCurrentInstance } from 'vue'

var appInstance = null

var message = document.getElementsByClassName("invites-msg")
var modal = document.getElementsByClassName("modal-invites")
var modalNotification = document.getElementsByClassName("modal-notification")
var messageNotification = document.getElementsByClassName("notification-msg")

export default {
  components: {
    Sidebar
  },
  setup() {
    appInstance = getCurrentInstance().appContext.config.globalProperties
  },
  data() {
    return {
      opponent_mail: null,
      invites: [],
      inviteId: null,
      invitation_expired: false
    }
  },
  methods: {
    accept() {
      appInstance.$BUTTON_CLICK.play()
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
      appInstance.$BUTTON_CLICK.play()
      api.decline_invite(this.$socket, this.opponent_mail)
      this.invites.splice(this.inviteId, 1)
      modal[0].className = "modal modal-invites"
    },
    checkInvite(invite, i) {
      this.opponent_mail = invite
      this.inviteId = i
      if(!store.state.in_game) {
        message[0].innerHTML = invite +" challenged you!"
      } else {
        message[0].innerHTML = "Can't start a game if you're already in one!"
      }
      modal[0].className = "modal modal-invites modal-open"
    },
    close() {
      appInstance.$BUTTON_CLICK.play()
      modalNotification[0].className = "modal modal-notification"
    }
  },
  sockets: {
    token_ok(res){
      store.commit('setToken',res.token)
      sessionStorage.token = res.token
      store.commit('setUser',res.user)
      console.log("got a fresh new token for ya")
    },
    token_error(res) {
      console.log("something wrong with tokens boy")
      sessionStorage.token = ""
      store.commit('unsetToken')
      this.$router.push("/404")
      messageNotification[0].innerHTML = "You need to sign in before do something"
      modalNotification[0].className = "modal modal-notification modal-open"
    },
    permit_error(error) {
      console.log(error)
      messageNotification[0].innerHTML = "You don't have the permissions"
      modalNotification[0].className = "modal modal-notification modal-open"
    },
    server_error(error) {
      console.log(error)
      messageNotification[0].innerHTML = "There is some server-side problem, please try again soon "
      modalNotification[0].className = "modal modal-notification modal-open"
    },
    client_error(error) {
      console.log(error)
      messageNotification[0].innerHTML = "Your token expired, please log-in again"
      modalNotification[0].className = "modal modal-notification modal-open"
    },
    lobby_deleted(msg) {
      console.log(msg)
    },
    lobby_invitation(msg) {
      console.log(msg)
      appInstance.$NOTIFICATION.play()
      for(let i = 0; i < this.invites.length; i++) {
        if(this.invites[i] === msg) {
          this.invites[i] = msg
          return
        }
      }
      this.invites.push(msg)
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
    },
    invitation_timeout(res) {
      console.log(res)
      if(res === store.getters.user.mail ) {
        messageNotification[0].innerHTML = "Your invitation has expired"
      } else {
        messageNotification[0].innerHTML = "The invite by " + res + " has expired"
      }
      modalNotification[0].className = "modal modal-notification modal-open"
      if(this.invites.includes(res)) {
        this.invites = this.invites.filter(el => el !== res)
      }
    },
    invite_error(msg) {
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
::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}
#main, .middle {
  background-color: #343232;
}
#main {
  overflow: hidden;
}
.middle {
  overflow-y: scroll;
  overflow-x: hidden;
}
@media only screen and (max-width: 785px) {
  #main {
    flex-direction: column;
    max-height: 100vh;
  }
  .sidebar {
    max-height: 5.5rem;
    height: 5rem;
    min-width: 100%;
    width: max-content;
  }
  .middle {
    min-height: min-content;
    overflow-y: auto;
    overflow-x: auto;
  }
}
</style>

<style scoped>
.modal-box {
  background-color: #343232;
}
</style>
