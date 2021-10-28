<template>
  <div class="profile">
    <div class="card lg:card-side bordered">
      <figure>
        <img src="https://picsum.photos/id/1005/400/250">
      </figure> 
      <div class="card-body">
        <h2 class="card-title">Horizontal</h2> 
        <p>Rerum reiciendis beatae tenetur excepturi aut pariatur est eos. Sit sit necessitatibus veritatis sed molestiae voluptates incidunt iure sapiente.</p> 
        <div class="card-actions">
          <button class="btn btn-primary">Get Started</button> 
          <button class="btn btn-ghost">More info</button>
        </div>
      </div>
    </div>
    <div class="tabs">
      <a v-on:click="dataInfo()" id="dataInfo" class="tab tab-lg tab-lifted tab-active">DataInfo</a>
      <a v-on:click="matchInfo()" id="matchInfo" class="tab tab-lg tab-lifted">MatchInfo</a>
    </div>
    <div id="content" class="card shadow-lg">
      <div id="tabDiv" class="card-body">
        <h2 class="card-title">Dati Utente</h2>
        <div class="info"></div>
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
    //DataInfo,
    //MatchInfo
  },
  methods: {
    dataInfo() {
      const dataInfo = createApp(DataInfo)
      document.getElementById("dataInfo").setAttribute("class", "tab tab-lg tab-lifted tab-active");
      document.getElementById("matchInfo").setAttribute("class", "tab tab-lg tab-lifted");
      dataInfo.mount(wrapper[0])
    },
    matchInfo() {
      const matchInfo = createApp(MatchInfo)
      document.getElementById("dataInfo").setAttribute("class", "tab tab-lg tab-lifted");
      document.getElementById("matchInfo").setAttribute("class", "tab tab-lg tab-lifted tab-active");
      matchInfo.mount(wrapper[0])
    }
  }
}
</script>

<style>
.overflow-hidden{
  padding: 3%;
}
.tabs {
  margin-top: 3%;
}
#content {
  margin-top: 3%;
}
</style>