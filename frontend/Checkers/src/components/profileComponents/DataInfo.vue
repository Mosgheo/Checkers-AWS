<template>
  <div class="form-control items-center">

    <label class="label">
      <span class="font-semibold label-text">Nome utente</span>
    </label> 
    <input type="text" placeholder="Username" :value="getUsername" class="text-sm username input input-bordered w-screen">
    
    <label class="label mt-3">
      <span class="font-semibold label-text">Nome</span>
    </label> 
    <input type="text" placeholder="Nome" :value ="getFirstName" class="text-sm first_name input input-bordered w-screen">

    <label class="label mt-3">
      <span class="font-semibold label-text">Cognome</span>
    </label> 
    <input type="text" placeholder="Cognome" :value="getLastName" class="text-sm last_name input input-bordered w-screen">

    
    <label class="label mt-3">
      <span class="font-semibold label-text">Email</span>
    </label> 
    <input type="text" placeholder="info@site.com" :value="getMail" class="text-sm mail input input-bordered w-screen">

    <label class="label mt-3">
      <span class="font-semibold label-text">Avatar</span>
    </label> 
   <input
      ref="fileInput"
      type="file"
      @input="uploadImage"
      class="avatarrs">
    <!--<select class="select select-bordered w-full max-w-xs mt-10">
      <option disabled="disabled" selected="selected">Selezione Località</option> 
      <option>Los Angeles</option> 
      <option>New York</option> 
      <option>Bologna</option>
    </select>-->

    <div class="object-center space-x-2 mt-10">
      <label class="btn font-semibold text-base" @click.prevent="save_profile">Modifica</label> 
    </div>

    <div class="update-modal modal modal-close">
      <div class="modal-box">
        <p class="msg">Ciao</p> 
        <div class="modal-action justify-center">
            <label class="btn" @click="close">Accept</label>
        </div>
      </div>
    </div>
    
  </div> 
</template>

<script>
import store from '@/store'
import api from '@/../api.js'

var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

var user = null
var update_modal = document.getElementsByClassName("update-modal")
var msg = document.getElementsByClassName("msg")
var avatar = ""

export default {
  name: "UserInfo",
  setup() {
    user = store.getters.user
  },
  /*data() {
    api.get_profile(this.$socket)
    return {

    }
  },*/
  computed: {
    getUsername() {
      if(user.username !== "") {
        return "" + user.username
      }
      return "Username"
    },
    getMail() {
      if(user.mail !== "") {
        return "" + user.mail
      }
      return "info@site.com"
    },
    getFirstName(){
      if(user.first_name === ""){
        return "Nome"
      }else{
        return user.first_name
      }
    },
    getLastName(){
      if(user.last_name === ""){
        return "Cognome"
      }else{
        return user.last_name
      }
    }
  },
  methods:{
    save_profile() {
      button_click.play()

      const user = {
          username : document.getElementsByClassName("username")[0].value,
          first_name : document.getElementsByClassName("first_name")[0].value,
          last_name : document.getElementsByClassName("last_name")[0].value,
          mail : document.getElementsByClassName("mail")[0].value,
          avatar: avatar
      }

      var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      if(user.mail.match(mailformat)) {
        api.update_profile(this.$socket, user, localStorage.token)
      } else {
        msg[0].textContent = "Insert a valid email and/or check that the passwords are the same"
        update_modal[0].setAttribute("class", "update-modal modal modal-open")
      }
      //TODO UPDATE STATE.USER AND SEND UPDATE TO BACKEND
      //api.update_profile(this.$socket, user, localStorage.token)
    },
    close() {
      button_click.play()
      update_modal[0].setAttribute("class", "update-modal modal")
      this.$forceUpdate()
    },
    uploadImage(){
      let input = this.$refs.fileInput
      let file = input.files
      if (file && file[0]) {
        var image = new Image()
        let reader = new FileReader
        image.onload = function(){
          var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            //ctx.drawImage(image, 0, 0, canvas.width,canvas.height);
            var hRatio = canvas.width / image.width    ;
            var vRatio = canvas.height / image.height  ;
            var ratio  = Math.min ( hRatio, vRatio );
            var centerShift_x = ( canvas.width - image.width*ratio ) / 2;
            var centerShift_y = ( canvas.height - image.height*ratio ) / 2;  
            ctx.clearRect(0,0,canvas.width, canvas.height);
            ctx.drawImage(image, 0,0, image.width, image.height,
                    centerShift_x,centerShift_y,image.width*ratio, image.height*ratio);  
            var dataurl = canvas.toDataURL(image.type);
            avatar = dataurl
            console.log(avatar)
        }

        reader.onload = e => {
          console.log(e.target.result)
          image.src = e.target.result
        }
        reader.readAsDataURL(file[0])
    }}
  },
  sockets:{
    updated_user(user) {
      msg[0].textContent = "Update successful"
      update_modal[0].setAttribute("class", "update-modal modal modal-open")
      store.commit('setUser',user)
    },
    user_profile(res) {
      console.log(res)
    }
  }
}
</script>

<style scoped>
span {
  color: #CDCBCB;
}
input {
  max-width: 20rem;
  background-color: #343232;
}
.select {
  background-color: #343232;
}
.avatarss{
  max-height: 100%; 
  max-width: 100%;
}
@media only screen and (max-width: 900px) {
  input {
    max-width: 13rem;
  }
}
</style>

