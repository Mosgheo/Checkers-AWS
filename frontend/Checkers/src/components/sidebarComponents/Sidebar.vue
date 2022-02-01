<template>
<div>
  <div class="sidebar flex flex-col">
    <router-link to="/">
      <img src="@/assets/logo.png" class="mask w-40 h-40 my-5 ml-5 mask-squircle"/>
    </router-link>

    <div class="dropdown mt-5">
      <SidebarLink class="barMenu pl-1.5" to="" icon="fas fa-bars"></SidebarLink>
      <ul tabindex="0" class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
        <li>
          <SidebarLink class="w-44 profile-drop mb-3 pl-0.5" to="/profile" icon="fas fa-user-cog">Profilo</SidebarLink>
        </li> 
        <li>
          <SidebarLink class="leaderboard-drop w-44 mb-3 pl-0.5" to="/leaderboard" icon="fas fa-chart-bar">Leaderboard</SidebarLink>
        </li>
      </ul>
    </div>
    <SidebarLink class="w-44 home mb-3 pl-0.5" to="/" icon="fas fa-home">Home</SidebarLink>
    <SidebarLink class="w-44 profile mb-3 pl-0.5" to="/profile" icon="fas fa-user-cog">Profilo</SidebarLink>
    <SidebarLink class="leaderboard w-44 mb-3 pl-0.5" to="/leaderboard" icon="fas fa-chart-bar">Leaderboard</SidebarLink>

    <div class="mx-3 mt-40 indicator">
      <div v-if="this.invites.length > 0" class="indicator-item badge badge-secondary"></div>
      <div v-else></div>
      <div v-if="this.invites.length > 0" class="dropdown dropdown-right">
        <SidebarLink class="notifications w-44 p-0.5" to="" icon="fas fa-bell">Notifiche</SidebarLink>
        <ul tabindex="0" class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
          <template v-for="(invite, i) in this.invites" :key="i">
            <li>
              <a @click="checkInvite(invite, i)">Invito di {{ invite }}</a>
            </li> 
          </template>
        </ul>
      </div>
      <div v-else class="dropdown dropdown-right">
        <SidebarLink class="notifications w-44 p-0.5" to="" icon="fas fa-bell">Notifiche</SidebarLink>
        <ul tabindex="0" class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
          <li>
            <a>Non ci sono notifiche al momento</a>
          </li> 
        </ul>
      </div>
    </div>
    
    <!--<div v-if="!$store.loading.value">-->
    <SidebarLink class="w-44 login mt-96 p-0.5"  to="/login" icon="fas fa-user-lock" >Log in</SidebarLink>
    <!--</div>-->
  </div>
</div>
</template>

<script>
import SidebarLink from './SidebarLink'

var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

export default {
  components: { 
    SidebarLink 
  },
  props: ['invites'],
  created() {
    window.addEventListener("resize", this.resizeHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeHandler);
  },
  data() {
    return {
      screenWidth: window.innerWidth
    }
  },
  methods: {
    resizeHandler() {
      this.screenWidth = window.innerWidth
    },
    checkInvite(invite, i) {
      button_click.play()
      this.$emit("checkInvite", invite, i)
    }
  }
}
</script>

<style>
:root {
  --sidebar-bg-color: #1F1E1E;
  --sidebar-item-hover: #151414;
  --sidebar-item-active: #151414;
}
</style>

<style scoped>
.sidebar {
  color: white;
  background-color: var(--sidebar-bg-color);
  transition: 0.3s ease;
}
.dropdown-content {
  background-color: #666666;
}
.barMenu {
  visibility: hidden;
  width: 0;
  height: 0;
}

@media only screen and (max-width: 1200px) {
  img {
    max-width: 4rem;
    max-height: 4rem;
    height: 4rem;
    width: 4rem;
    margin: 0.5rem;
  }
  .home, .profile, .leaderboard, .login {
    width: 3rem;
    padding-left: 0.8rem;
    padding-right: 0.1rem;
  }
  .notifications {
    width: 3rem;
    padding-left: 1rem;
  }
  .home, .profile, .leaderboard {
    margin: 0;
    margin-top: 0.5rem;
  }
}

@media only screen and (max-width: 785px) {
  .sidebar {
    flex-direction: row;
    justify-content: space-evenly;
  }
  .barMenu {
    visibility: visible;
    width: 3rem;
    height: 3rem;
    padding-left: 0.9rem;
  }
  .login {
    width: auto;
    margin-top: 0rem;
  }
  .home, .profile, .leaderboard {
    display: none;
  }
  .notifications, .indicator {
    width: auto;
    margin-top: 0.5rem;
  } 
}
</style>