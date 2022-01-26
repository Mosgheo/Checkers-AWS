<template>
<div>
  <div class="sidebar flex flex-col" v-if="this.screenWidth > 1250">
    <router-link to="/">
      <img src="@/assets/logo.png" class="mask w-40 h-40 my-5 ml-5 mask-squircle"/>
    </router-link>

    <SidebarLink class="flex-none w-44 home mb-3 pl-0.5" to="/" icon="fas fa-home">Home</SidebarLink>
    <SidebarLink class="flex-none w-44 profile mb-3 pl-0.5" to="/profile" icon="fas fa-user-cog">Profilo</SidebarLink>
    <SidebarLink class="leaderboard w-44 mb-3 pl-0.5" to="/leaderboard" icon="fas fa-chart-bar">Leaderboard</SidebarLink>
    
    <div class="mx-3 mt-40 indicator">
      <div v-if="this.invites.length > 0" class="indicator-item badge badge-secondary"></div>
      <div v-else></div>
      <div v-if="this.invites.length > 0" class="dropdown dropdown-right">
        <SidebarLink class="notifications w-44 pl-0.5" to="" icon="fas fa-bell">Notifiche</SidebarLink>
        <ul tabindex="0" class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
          <template v-for="(invite, i) in this.invites" :key="i">
            <li>
              <a @click="checkInvite(invite, i)">Invito di {{ invite }}</a>
            </li> 
          </template>
        </ul>
      </div>
      <div v-else class="dropdown dropdown-right">
        <SidebarLink class="notifications w-44 pl-0.5" to="" icon="fas fa-bell">Notifiche</SidebarLink>
        <ul tabindex="0" class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
          <li>
            <a>Non ci sono notifiche al momento</a>
          </li> 
        </ul>
      </div>
    </div>
    
    <!--<div v-if="!$store.loading.value">-->
    <SidebarLink class="flex-none w-44 login mt-96 pl-0.5"  to="/login" icon="fas fa-user-lock" >Log in</SidebarLink>
    <!--</div>-->
  </div>

  <div v-else class="sidebar flex flex-row justify-around">
    <router-link to="/">
      <img src="@/assets/logo.png" class="justify-self-start min-h-min w-16 h-16 my-2 ml-2 mask mask-squircle"/>
    </router-link>

    <SidebarLink class="home ml-5 p-0.5" to="/" icon="fas fa-home">Home</SidebarLink>
    <SidebarLink class="profile ml-3 p-0.5" to="/profile" icon="fas fa-user-cog">Profilo</SidebarLink>
    <SidebarLink class="leaderboard ml-3 p-0.5" to="/leaderboard" icon="fas fa-chart-bar">Leaderboard</SidebarLink>
    
    <div class="my-4 indicator">
      <div v-if="this.invites.length > 0" class="indicator-item badge badge-secondary"></div>
      <div v-else></div>
      <div v-if="this.invites.length > 0" class="dropdown dropdown-end">
        <SidebarLink class="notifications pl-0.5" to="" icon="fas fa-bell">Notifiche</SidebarLink>
        <ul tabindex="0" class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
          <template v-for="(invite, i) in this.invites" :key="i">
            <li>
              <a @click="checkInvite(invite, i)">Invito di {{ invite }}</a>
            </li> 
          </template>
        </ul>
      </div>
      <div v-else class="dropdown dropdown-end">
        <SidebarLink class="notifications" to="" icon="fas fa-bell">Notifiche</SidebarLink>
        <ul tabindex="0" class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
          <li>
            <a>Non ci sono notifiche al momento</a>
          </li> 
        </ul>
      </div>
    </div>
    <!--<div v-if="!$store.loading.value">-->
    <SidebarLink class="login mr-3 p-0.5"  to="/login" icon="fas fa-user-lock" >Log in</SidebarLink>
    <!--</div>-->
  </div>
</div>
</template>

<script>
import SidebarLink from './SidebarLink'

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
</style>