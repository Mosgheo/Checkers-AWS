<template>
<div class="flex flex-col justify-center">
    <div class="pt-20">
        <h1 class="font-bold text-3xl">Registrati su Checkers</h1>
    </div>
    <div class="card">
        <div class="card-body items-center justify-center">
            <div class="form-control rounded-lg items-center">

                <div class="block">
                    <label class="label">
                        <span class="font-semibold label-text mt-5">Nome utente</span>
                    </label> 
                    <input type="text" placeholder="Crea un nome utente" class="username input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="font-semibold label-text mt-5">Nome</span>
                    </label> 
                    <input type="text" placeholder="Inserisci Nome" class="first_name input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="font-semibold label-text mt-5">Cognome</span>
                    </label> 
                    <input type="text" placeholder="Inserisci Cognome" class="last_name input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="font-semibold label-text mt-5">Inserisci la tua mail</span>
                    </label> 
                    <input type="email" placeholder="Inserisci la tua mail" class="mail input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="font-semibold label-text mt-5">Password</span>
                    </label> 
                    <input type="password" placeholder="Inserisci la password" class="password input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="font-semibold label">
                        <span class="label-text mt-5">Conferma Password</span>
                    </label> 
                    <input type="password" placeholder="Reinserisci la password" class="confirm_password input input-bordered w-13">
                </div>

                <div class="object-center space-x-2 mb-3 mt-10">
                    <label class="text-base font-semibold btn" @click="signup">Iscriviti</label> 
                    <div class="signup-modal modal modal-close">
                        <div class="modal-box">
                            <p class="msg">Ciao</p> 
                            <div class="modal-action">
                                <label class="btn" @click="close">Accept</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import api from '../../api.js'

/*var username_input = document.getElementsByClassName("username")
var first_name_input = document.getElementsByClassName("first_name")
var last_name_input= document.getElementsByClassName("last_name")
var mail_input = document.getElementsByClassName("mail")
var pw_input = document.getElementsByClassName("password")
var confirm_pw_input = document.getElementsByClassName("confirm_password")*/
var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

var signup_modal = document.getElementsByClassName("signup-modal")
var msg = document.getElementsByClassName("msg")
var signup = false

export default {
    name: "Signup",
    methods: {
        signup() {
            button_click.play()
            var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            var username = document.getElementsByClassName("username")[0].value
            var first_name = document.getElementsByClassName("first_name")[0].value
            var last_name = document.getElementsByClassName("last_name")[0].value
            var mail = document.getElementsByClassName("mail")[0].value
            var pw = document.getElementsByClassName("password")[0].value
            var confirm_pw = document.getElementsByClassName("confirm_password")[0].value

            if(mail.match(mailformat) && pw === confirm_pw) {
                console.log("" + first_name + " " + last_name + " " + username + " " + mail)
                api.signup(this.$socket, mail, pw, username, first_name, last_name)
            } else {
                msg[0].textContent = "Insert a valid email and/or check that the passwords are the same"
                signup_modal[0].setAttribute("class", "signup-modal modal modal-open")
            }
        },
        close() {
            button_click.play()
            signup_modal[0].setAttribute("class", "signup-modal modal modal-close")
            if(signup) {
                this.$router.push("/login")
            }
        }
    },
    sockets: {
        signup_success(res) {
            signup = true
            msg[0].textContent = res.message
            signup_modal[0].setAttribute("class", "signup-modal modal modal-open")
        },
        signup_error(res) {
            msg[0].textContent = ""
            res.forEach(elem => {
                msg[0].textContent = elem.message + "\n"
            })
            msg[0].textContent = res[0].message
            signup_modal[0].setAttribute("class", "signup-modal modal modal-open")
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