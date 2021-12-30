import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueSocketIO from 'vue-3-socket.io'
import SocketIO from 'socket.io-client'
import  store  from './store'
import api from '../api'
import '@/assets/styles/app.css'

import '@fortawesome/fontawesome-free/js/all'

export const app = createApp(App)
app.config.productionTip = false
app.config.globalProperties.$BOARD_SIZE = 10
app.config.globalProperties.$COLOR_TOP = "color-top"
app.config.globalProperties.$COLOR_BOTTOM ="color-bottom"
app.config.globalProperties.$PLAYER_ONE = "one"
app.config.globalProperties.$PLAYER_TWO = "two"
app.config.globalProperties.$PIECE_TYPE_MAN ="man"
app.config.globalProperties.$PIECE_TYPE_KING = "king"
const connection = SocketIO('http://localhost:3030')
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
  app.mount('#app')
}
connection.on("token_ok", function(){
  console.log("DIO CANE")
})


async function token_timeout() {
  setTimeout(async function () {
    console.log("refreshing token")
    const token = await api.refresh_token(SocketIO,sessionStorage.token)
    if(token !== null){
      store.commit('setToken',token)
      sessionStorage.token = token
      var tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64'));
      token_timeout(tokenData,/*when it should expire*/50000);
    }else{
      sessionStorage.token = ""
      store.commit('unsetToken')
    }
  },/*when it should expire*/50000/**FIX */);
}

 load_old_token()

/*function callbackRedirect(appState) {
  router.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : '/'
  );
}

setupAuth(authConfig, callbackRedirect).then((auth) => {
  app.use(auth).mount('#app')
})*/
