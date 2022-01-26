<template>
<div class="flex flex-col justify-center">
    <div class="pt-20 font-bold text-3xl">
        <h1>Accedi a Checkers</h1>
    </div>
    <div class="card">
        <div class="card-body items-center">
            <div class="form-control rounded-lg items-center">

                <div class="block">
                    <label class="label">
                        <span class="font-semibold label-text mt-2">E-mail</span>
                    </label> 
                    <input type="text" placeholder="Inserisci e-mail" class="font-base mail input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="font-semibold label-text mt-2">Password</span>
                    </label> 
                    <input type="password" placeholder="Inserisci la password" class="font-base password input input-bordered w-13">
                </div>

                <div class="object-center space-x-2 mt-10">
                    <label class="btn text-base font-semibold" @click="login">Login</label> 
                    <div class="login-fail modal">
                        <div class="modal-box">
                            <p class="msg text-base font-semibold">Ciao</p> 
                            <div class="modal-action">
                                <label class="btn text-base" @click="close">Accept</label>
                            </div>
                        </div>
                    </div>
                </div>
 
                <div class="divider"></div> 

                <label class="label">
                    <span class="label-text">Se non sei ancora iscritto</span>
                </label> 
                <router-link to="/signup">
                    <button @click="buttonClick" class="font-bold text-lg btn-link mb-3">Iscriviti</button>
                </router-link>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import api from '@/../api.js'
import store from '@/store'

var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

var mail = document.getElementsByClassName("mail")
var password = document.getElementsByClassName("password")
var login_fail = document.getElementsByClassName("login-fail")
var msg = document.getElementsByClassName("msg")

export default {
    name: "Login",
    methods: {
        login() {
            button_click.play()
            if(mail[0].value === "" && password[0].value === "") {
                msg[0].textContent = "Insert a valid email and/or password"
                login_fail[0].setAttribute("class", "login-fail modal modal-open")
            } else {
                api.login(this.$socket, mail[0].value, password[0].value)
            }
        },
        close() {
            button_click.play()
            login_fail[0].setAttribute("class", "login-fail modal")
            mail[0].value = ""
            password[0].value = ""
        },
        buttonClick() {
            button_click.play()
        }
    },
    sockets:{
        login_ok(res) {
            //EXAMPLE ON HOW TO USE STORE
            store.commit('setToken',res.token)
            store.commit('setUser',res.user)
            this.$router.push("/")
        },
        login_error(err) {
            msg[0].textContent = err.message
            login_fail[0].setAttribute("class", "login-fail modal modal-open")
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