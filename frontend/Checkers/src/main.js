import { createApp } from 'vue'
import App from './App'
import router from './router'
import VueSocketIO from 'vue-3-socket.io'
import SocketIO from 'socket.io-client'
import  store  from './store'
import authConfig from '../auth_config.json'
import { setupAuth } from './auth'
import '@/assets/styles/app.css'

import '@fortawesome/fontawesome-free/js/all'

export const app = createApp(App)
app.config.productionTip = false
app.config.globalProperties.$BOARD_SIZE = 8
app.config.globalProperties.$COLOR_TOP = "color-top"
app.config.globalProperties.$COLOR_BOTTOM ="color-bottom"
app.config.globalProperties.$PLAYER_ONE = "one"
app.config.globalProperties.$PLAYER_TWO = "two"
app.config.globalProperties.$PIECE_TYPE_MAN ="man"
app.config.globalProperties.$PIECE_TYPE_KING = "king"

app
.use(new VueSocketIO({
  connection: SocketIO('http://localhost:3030'),
  vuex: false,
}))
.use(router)
.use(store)

function callbackRedirect(appState) {
  router.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : '/'
  );
}

setupAuth(authConfig, callbackRedirect).then((auth) => {
  app.use(auth).mount('#app')
})
