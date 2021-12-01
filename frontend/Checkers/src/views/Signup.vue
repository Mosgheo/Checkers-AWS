<template>
    <div class="card shadow-lg">
        <div class="card-body items-center">
            <div class="form-control rounded-lg items-center">

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Nome utente</span>
                    </label> 
                    <input type="text" placeholder="Crea un nome utente" class="username input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Nome</span>
                    </label> 
                    <input type="text" placeholder="Inserisci Nome" class="first_name input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Cognome</span>
                    </label> 
                    <input type="text" placeholder="Inserisci Cognome" class="last_name input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Inserisci la tua mail</span>
                    </label> 
                    <input type="email" placeholder="Inserisci la tua mail" class="mail input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Password</span>
                    </label> 
                    <input type="password" placeholder="Inserisci la password" class="password input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Conferma Password</span>
                    </label> 
                    <input type="password" placeholder="Reinserisci la password" class="confirm_password input input-bordered w-13">
                </div>

                <div class="object-center space-x-2 mb-3 mt-10">
                    <button class="btn" @click.prevent="signup()">Iscriviti</button>
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

export default {
    name: "Signup",
    methods: {
        signup:function() {
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
                console.log(pw)
                console.log(confirm_pw)
                //api.signup(this.$socket,this.email,this.password,"berlin123")
            }
        }
    },
    sockets:{
        signup_success(res){
            //PRINT SIGNUP RESULT
            console.log(res.message)
        },
        signup_errror(res){
            //PRINT SOMETHING
            console.log(res.message)
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