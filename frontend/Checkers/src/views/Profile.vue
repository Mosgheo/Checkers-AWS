<template>
  <div class="profile flex flex-col">
    <div class="basic-info card lg:card-side flex flex-row">
      <img v-bind:src="getAvatar" class="mask mask-square p-5">
      <div class="p-3">
        <div class="flex p-2">
          <h2 v-bind:innerText="getUsername" class="card-title"></h2>
          <div class="avatar">
            <div class="ml-1 rounded-btn w-11 h-11">
              <img v-bind:src="getAvatar" class="avatar2">
            </div>
          </div>
        </div> 
        <p v-bind:innerText="getFirstLastName" class="text-left p-2">Nome Cognome</p> 
      </div>
    </div>

    <div class="profile-info rounded-xl bordered mt-10">
      <div class="tabs tabs-boxed pl-5 mt-5">
        <a v-on:click="dataInfo()" id="dataInfo" class="tab tab-lg tab-active">Dati Utente</a>
        <a v-on:click="matchInfo()" id="matchInfo" class="tab tab-lg ">Partite</a>
      </div>
      <div id="content" class="card shadow-lg mt-2">
        <div id="tabDiv" class="card-body">
          <h2 class="card-title">Dati Utente</h2>
          <DataInfo class="info"></DataInfo>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import DataInfo from "@/components/profileComponents/DataInfo";
import MatchInfo from "@/components/profileComponents/MatchInfo";
import { createApp } from 'vue';
import store from '@/store'

var user = null
const wrapper = document.getElementsByClassName("info")

export default {
  name: 'Profile',
  components: {
    DataInfo
    //MatchInfo
  },
  setup() {
    user = store.getters.user
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
      if(!elem.getAttribute("class").includes("tab-active")) {
        const dataInfo = createApp(DataInfo)
        elem.setAttribute("class", "tab tab-lg tab-active");
        document.getElementById("matchInfo").setAttribute("class", "tab tab-lg");
        ((document.getElementsByClassName("card-title"))[1]).innerHTML = "Dati Utente"
        dataInfo.mount(wrapper[0])
      }
    },
    matchInfo() {
      const elem = document.getElementById("matchInfo")
      if(!elem.getAttribute("class").includes("tab-active")) {
        const matchInfo = createApp(MatchInfo)
        document.getElementById("dataInfo").setAttribute("class", "tab tab-lg");
        elem.setAttribute("class", "tab tab-lg tab-active");
        ((document.getElementsByClassName("card-title"))[1]).innerHTML = "Storico Partite"
        matchInfo.mount(wrapper[0])
      }
    },
  }
}
</script>

<style scoped>
.profile {
  padding: 3.8em 3.8em 2em 15em
}

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
    max-width: 300px;
    max-height: 300px;
}

@media (max-width: 785px) {
  img {
    width: 150px;
    height: 150px;
  }
  .profile {
    margin-left: 2em;
  } 
}
</style>