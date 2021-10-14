
<template>
  <div class="sidebar" :style="{ width: sidebarWidth }">
    <h1>
      <!--<span v-if="collapsed">
        <div>V</div>
        <div>S</div>
      </span>
      <span v-else>Checkers</span>-->
      <span>Checkers</span>
    </h1>

    <SidebarLink class="home" to="/" icon="fas fa-home">Home</SidebarLink>
    <SidebarLink class="profile" to="/profile" icon="fas fa-user-cog">Profilo</SidebarLink>
    <SidebarLink class="leaderboard" to="/leaderboard" icon="fas fa-chart-bar">Leaderboard</SidebarLink>
    <SidebarLink class="domande" to="/domande" icon="fas fa-question">Domande</SidebarLink>

    <div v-if="!$auth.loading.value">
        <SidebarLink class="login" to="" icon="fas fa-user-lock" v-if="!$auth.isAuthenticated.value" @click="login">Log in</SidebarLink>
        <SidebarLink class="logout" to="" v-if="$auth.isAuthenticated.value" @click="logout">Log out</SidebarLink>
    </div>

    <!--<span
      class="collapse-icon"
      :class="{ 'rotate-180': collapsed }"
      @click="toggleSidebar"
    >
      <i class="fas fa-angle-double-left" />
    </span> -->
    
  </div>
</template>

<script>
import SidebarLink from './SidebarLink'
import { /*collapsed, toggleSidebar,*/ sidebarWidth } from './state'

export default {
  props: {},
  components: { SidebarLink },
  setup() {
    return { /*collapsed, toggleSidebar,*/ sidebarWidth }
  },
  methods: {
    login() {
      this.$auth.loginWithRedirect();
    },
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      });
    }
  }
}
</script>

<style>
:root {
  --sidebar-bg-color: #2f855a;
  --sidebar-item-hover: #38a169;
  --sidebar-item-active: #276749;
}
</style>

<style scoped>
.sidebar {
  color: white;
  background-color: var(--sidebar-bg-color);
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  bottom: 0;
  padding: 0.5em;
  transition: 0.3s ease;
}
.sidebar h1 {
  height: 2.5em;
  font-size: 30px;
  margin-bottom: 10%;
}
/*collapse-icon {
  position: absolute;
  bottom: 0;
  padding: 0.75em;
  color: rgba(255, 255, 255, 0.7);
  transition: 0.2s linear;
}
.rotate-180 {
  transform: rotate(180deg);
  transition: 0.2s linear;
}*/
.profile, .leaderboard, .domande{
  margin-top: 10%;
}
.login, .logout {
  margin-top: 50%;
}
</style>