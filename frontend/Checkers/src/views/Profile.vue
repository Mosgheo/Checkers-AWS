<template>
  <div class="profile">
    <div class="card lg:card-side bordered">
      <img src="https://picsum.photos/id/1005/250" class="mask mask-square p-5">
      <div class="p-3">
        <div class="flex p-2">
          <h2 class="card-title">Username</h2>
          <div class="avatar">
            <div class="ml-1 rounded-btn w-11 h-11">
              <img src="http://daisyui.com/tailwind-css-component-profile-1@40w.png">
            </div>
          </div>
        </div> 
        <p class="text-left p-2">Nome Cognome</p> 
      </div>
    </div>
    <div class="rounded-xl bordered mt-10">
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

const wrapper = document.getElementsByClassName("info")

export default {
  name: 'Profile',
  components: {
    DataInfo
    //MatchInfo
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
    }
  }
}
</script>

<style>
</style>