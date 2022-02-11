<template>
  <div class="form-control items-center">

    <label class="label">
      <span class="font-semibold label-text">Username</span>
    </label> 
    <input type="text" placeholder="Username" :value="this.username" class="text-sm username input input-bordered w-screen">
    
    <label class="label mt-3">
      <span class="font-semibold label-text">FirstName</span>
    </label> 
    <input type="text" placeholder="Nome" :value ="this.first_name" class="text-sm first_name input input-bordered w-screen">

    <label class="label mt-3">
      <span class="font-semibold label-text">LastName</span>
    </label> 
    <input type="text" placeholder="Cognome" :value="this.last_name" class="text-sm last_name input input-bordered w-screen">

    
    <label class="label mt-3">
      <span class="font-semibold label-text">Email</span>
    </label> 
    <input type="text" placeholder="info@site.com" :value="this.mail" class="text-sm mail input input-bordered w-screen">

    <label class="label mt-3">
      <span class="font-semibold label-text">Change Avatar</span>
    </label>
    <div>
      <label for="load-image">
        <img src="https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/128/Downloads-icon.png" alt="Upload Image" />
      </label>
      <input id="load-image" ref="file-input" type="file" accept="image/png, image/gif, image/jpeg" 
        @input="uploadImage" >
    </div>

    <div class="object-center space-x-2 mt-10">
      <label class="btn font-semibold text-base" @click.prevent="save_profile">Save</label> 
    </div>

    <div class="update-modal modal modal-close">
      <div class="modal-box">
        <div class="flex flex-col items-center">
          <img class="w-40 h-28" src="@/assets/msg_image.png" alt="Modal Logo Image" />
          <p class="font-semibold text-base msg">Ciao</p> 
        </div>
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
import { getCurrentInstance } from 'vue'

var appInstance = null
var user = null
var update_modal = document.getElementsByClassName("update-modal")
var msg = document.getElementsByClassName("msg")
var avatar = ""

export default {
  name: "UserInfo",
  setup() {
    user = store.getters.user
    appInstance = getCurrentInstance().appContext.config.globalProperties
  },
  data() {
    api.get_profile(this.$socket)
    return {
      first_name: "Name",
      last_name: "LastName",
      mail: "info@site.com",
      username: "Username"
    }
  },
  methods:{
    save_profile() {
      appInstance.$BUTTON_CLICK.play()

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
      appInstance.$BUTTON_CLICK.play()
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
      this.first_name = res.first_name
      this.last_name = res.last_name
      this.mail = res.mail
      this.username = res.username
    }
  }
}
</script>

<style scoped>
.modal-box {
  background-color: #343232;
}
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
#load-image {
  display: none;
}
@media only screen and (max-width: 900px) {
  input {
    max-width: 13rem;
  }
}
</style>

