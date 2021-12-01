<template>
    <div class="card shadow-lg">
        <div class="card-body items-center">
            <div class="form-control rounded-lg items-center">

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-2">E-mail</span>
                    </label> 
                    <input type="text" placeholder="Inserisci e-mail" class="mail input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-2">Password</span>
                    </label> 
                    <input type="password" placeholder="Inserisci la password" class="password input input-bordered w-13">
                </div>

                <div class="object-center space-x-2 mt-10">
                    <button class="btn" @click.prevent="login()">Login</button>
                </div>
 
                <div class="divider"></div> 

                <label class="label">
                    <span class="label-text">Se non sei ancora iscritto</span>
                </label> 
                <router-link to="/signup">
                    <button class="btn-link mb-3">Iscriviti</button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/../api.js'
import store from '@/store'

export default {
    name: "Login",
    methods: {
        login:function() {
            var mail = document.getElementsByClassName("mail")[0].value
            var password = document.getElementsByClassName("password")[0].value
            console.log("LOGGING IN " + mail + " " + password)
            if( mail === "" && password === "") {
                console.log("something wrong")
            } else {
                api.login(this.$socket,mail,password)
            }
        }
    },
    sockets:{
        login_ok(res){
            //EXAMPLE ON HOW TO USE STORE
            store.commit('setToken',res.token)
            store.commit('setUser',res.user)
            let user = store.getters.user
            console.log("TEST "+ user.username)
            //PRINT THAT YOU LOGGED IN
            console.log(res.message)
        },
        login_error(err){
            console.log(err)
        }
    }
}
</script>

<style scoped>
span {
  color: #CDCBCB;
}
input {
  max-width: 400px;
  background-color: #343232;
}
.card-body {
    background-color: #343232;
}
.form-control {
    max-width: 35em;
    width: 25em;
    background-color: #1F1E1E;
}
.divider {
    width: 15em;
}
.divider:after, .divider:before {
    background-color: #343232;
}
</style>