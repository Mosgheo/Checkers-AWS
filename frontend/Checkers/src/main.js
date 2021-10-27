import { createApp } from 'vue'
import App from './App'
import router from './router'
import VueSocketIO from 'vue-3-socket.io'
import SocketIO from 'socket.io-client'
import store from './store'
import authConfig from '../auth_config.json'
import { setupAuth } from './auth'
import '@/assets/styles/app.css'

import '@fortawesome/fontawesome-free/js/all'

const app = createApp(App)

app
.use(new VueSocketIO({
  connection: SocketIO('http://localhost:3032'),
  vuex: false,
}))
.use(router)
.use(store)

app.config.productionTip = false

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
