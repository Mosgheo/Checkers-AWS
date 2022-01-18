<template>
  <div id="app">
    <div class="flex flex-row">
      <Sidebar class="sidebar flex-none" />
      <div class="middle flex-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/sidebarComponents/Sidebar.vue'
import {sidebarWidth} from '@/components/sidebarComponents/state.js'
import store from './store'
export default {
  components: {
    Sidebar
  },
  setup() {
    return { sidebarWidth }
  },
  sockets:{
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
    }
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
