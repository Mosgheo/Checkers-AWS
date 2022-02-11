<template>
  <div class="profile flex flex-col justify-center items-center py-5">
    <div class="basic-info card lg:card-side flex flex-row w-9/12">
      <img :src="this.avatar" alt="User's Avatar" class="mask mask-square w-60 h-60 p-5">
      <div class="p-1">
        <div class="flex mt-2.5 ml-2">
          <h2 :innerText="this.username" class="font-semibold text-2xl card-title"></h2>
        </div>
        <div class="flex flex-row ml-2 font-semibold text-xl">
          <p>Stars</p>
          <i class="fas fa-star ml-1 mt-1" />
          <p :innerText="this.stars" class="ml-3"></p>
        </div> 
        <p :innerText="this.first_last_name" class="text-xl text-left ml-2 mt-2">FirstName LastName</p> 
      </div>
    </div>

    <div class="profile-info rounded-xl bordered mt-5 w-9/12">
      <div class="tabs tabs-boxed pl-5 justify-center">
        <a @click="dataInfo" id="dataInfo" class="tab tab-lg tab-active">User Info</a>
        <a @click="matchInfo" id="matchInfo" class="tab tab-lg ">Match History</a>
      </div>
      <div id="content" class="card shadow-lg">
        <div id="tabDiv" class="card-body">
          <div v-if="this.tabName === 'User Info'" >
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
import api from '@/../api'
import { getCurrentInstance } from 'vue'

var appInstance = null

var user = null
const wrapper = document.getElementsByClassName("info")

export default {
  name: 'Profile',
  components: {
    DataInfo,
    MatchInfo
  },
  setup() {
    appInstance = getCurrentInstance().appContext.config.globalProperties
  },
  data() {
    api.get_profile(this.$socket)
    return {
      avatar: "http://daisyui.com/tailwind-css-component-profile-1@40w.png",
      first_last_name: "Nome Cognome",
      username: "Username",
      tabName: "User Info",
      stars: "Stars"
    }
  },
  methods: {
    dataInfo() {
      const elem = document.getElementById("dataInfo")
      appInstance.$BUTTON_CLICK.play()
      if(!elem.getAttribute("class").includes("tab-active")) {
        this.tabName = "User Info"
        elem.setAttribute("class", "tab tab-lg tab-active");
        document.getElementById("matchInfo").setAttribute("class", "tab tab-lg");
        ((document.getElementsByClassName("card-title"))[1]).innerHTML = this.tabName
      }
    },
    matchInfo() {
      const elem = document.getElementById("matchInfo")
      appInstance.$BUTTON_CLICK.play()
      if(!elem.getAttribute("class").includes("tab-active")) {
        this.tabName = "Match History"
        elem.setAttribute("class", "tab tab-lg tab-active");
        document.getElementById("dataInfo").setAttribute("class", "tab tab-lg");
        ((document.getElementsByClassName("card-title"))[1]).innerHTML = this.tabName
      }
    },
  },
  sockets: {
    user_profile(res) {
      this.avatar = res.avatar
      this.first_last_name = res.first_name + " " + res.last_name
      this.username = res.username
      this.stars = res.stars
    }
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

@media only screen and (max-width: 850px) {
  img {
    width: 9rem;
    height: 9rem;
  }
}

@media only screen and (max-width: 700px) {
}
</style>