<template>
  <div class="profile flex flex-col items-center px-32 py-8">
    <div class="basic-info card lg:card-side flex flex-row w-9/12 max-w-screen-2xl">
      <img :src="getAvatar" class="mask mask-square w-60 h-60 p-5">
      <div class="p-3">
        <div class="flex p-2">
          <h2 :innerText="getUsername" class="font-semibold text-xl card-title"></h2>
          <div class="avatar">
            <div class="ml-1 rounded-btn w-14 h-14">
              <img :src="getAvatar" class="avatar2">
            </div>
          </div>
        </div> 
        <p :innerText="getFirstLastName" class="text-lg text-left p-2">Nome Cognome</p> 
      </div>
    </div>

    <div class="profile-info rounded-xl bordered mt-5 w-9/12 max-w-screen-2xl">
      <div class="tabs tabs-boxed pl-5 justify-center">
        <a @click="dataInfo" id="dataInfo" class="tab tab-lg tab-active">Dati Utente</a>
        <a @click="matchInfo" id="matchInfo" class="tab tab-lg ">Partite</a>
      </div>
      <div id="content" class="card shadow-lg">
        <div id="tabDiv" class="card-body">
          <div v-if="this.tabName === 'Dati Utente'" >
            <h2 class="card-title">{{ this.tabName }}</h2>
            <DataInfo class="info"></DataInfo>
          </div>
          <div v-else>
            <h2 class="card-title">{{ this.tabName }}</h2>
            <MatchInfo class="info"></MatchInfo>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import DataInfo from "@/components/profileComponents/DataInfo";
import MatchInfo from "@/components/profileComponents/MatchInfo";
import store from '@/store'

var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

var user = null
const wrapper = document.getElementsByClassName("info")

export default {
  name: 'Profile',
  components: {
    DataInfo,
    MatchInfo
  },
  setup() {
    user = store.getters.user
  },
  data() {
    return {
      tabName: "Dati Utente"
    }
  },
  computed: {
    getUsername() {
      if(user.username !== "") {
        return "" + user.username
      }
      return "Username"
    },
    getFirstLastName() {
      if(user.first_name == "" && user.last_name == "") {
        return "Nome Cognome"
      }else{
        return "" + user.first_name + " " + user.last_name
      }
    },
    getAvatar(){
      if(user.avatar === ""){
        return "http://daisyui.com/tailwind-css-component-profile-1@40w.png"
       }else{
        return user.avatar
       } 
    }
  },
  methods: {
    dataInfo() {
      const elem = document.getElementById("dataInfo")
      button_click.play()
      if(!elem.getAttribute("class").includes("tab-active")) {
        this.tabName = "Dati Utente"
        elem.setAttribute("class", "tab tab-lg tab-active");
        document.getElementById("matchInfo").setAttribute("class", "tab tab-lg");
        ((document.getElementsByClassName("card-title"))[1]).innerHTML = this.tabName
      }
    },
    matchInfo() {
      const elem = document.getElementById("matchInfo")
      button_click.play()
      if(!elem.getAttribute("class").includes("tab-active")) {
        this.tabName = "Storico Partite"
        elem.setAttribute("class", "tab tab-lg tab-active");
        document.getElementById("dataInfo").setAttribute("class", "tab tab-lg");
        ((document.getElementsByClassName("card-title"))[1]).innerHTML = this.tabName
      }
    },
  }
}
</script>

<style scoped>
.basic-info, .profile-info {
  background-color: #1F1E1E;
}
.tabs{
  background-color: #161512;
}
.tab {
  color: #A39D8F;
}
img {
  max-width: 14rem;
  max-height: 14rem;
}

@media only screen and (max-width: 800px) {
  img {
    width: 9rem;
    height: 9rem;
  }
  .profile {
    min-width: 50rem;
    padding-left: 0;
    padding-right: 20rem;
  }
}
</style>