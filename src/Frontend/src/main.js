import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueSocketIO from 'vue-3-socket.io'
import SocketIO from 'socket.io-client'
import store  from './store'
import api from '../api'
import '@/assets/styles/app.css'

import '@fortawesome/fontawesome-free/js/all'

export const app = createApp(App)
app.config.productionTip = false
app.config.globalProperties.$BOARD_SIZE = 10
app.config.globalProperties.$COLOR_TOP = "color-top"
app.config.globalProperties.$COLOR_BOTTOM = "color-bottom"
app.config.globalProperties.$BUTTON_CLICK = new Audio(require("@/assets/sounds/button-click.wav"))
app.config.globalProperties.$MOVE_PIECE = new Audio(require("@/assets/sounds/piece-move.wav"))
app.config.globalProperties.$NOTIFICATION = new Audio(require("@/assets/sounds/notification.mp3"))
const connection = SocketIO('http://localhost:3030')
const token_time = 86400000
app
.use(new VueSocketIO({
  connection: connection,
  vuex: store,
}))
.use(router)
.use(store)

async function load_old_token(){
  if(sessionStorage.token){
    console.log("there was a token!")
    api.refresh_token(connection,sessionStorage.token)
  }else{
    console.log("no token, sry")
    //sessionStorage.token = ""
    //store.commit('unsetToken')
  }
  token_timeout(token_time)
  app.mount('#app')
}


async function token_timeout(time) {
  setTimeout(async function () {
    console.log("refreshing token")
    api.refresh_token(connection,sessionStorage.token)
    token_timeout(time);
  },time);
}

 load_old_token()
