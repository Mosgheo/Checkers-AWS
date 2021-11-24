<template>
    <div class="card shadow-lg">
        <div class="card-body items-center">
            <div class="form-control rounded-lg items-center">

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Nome utente</span>
                    </label> 
                    <input type="text" placeholder="Crea un nome utente" class="input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Nome</span>
                    </label> 
                    <input type="text" placeholder="Inserisci Nome" class="input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Cognome</span>
                    </label> 
                    <input type="text" placeholder="Inserisci Cognome" class="input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Inserisci la tua mail</span>
                    </label> 
                    <input type="email" placeholder="Inserisci la tua mail" class="input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Password</span>
                    </label> 
                    <input type="password" placeholder="Inserisci la password" class="input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-5">Conferma Password</span>
                    </label> 
                    <input type="password" placeholder="Reinserisci la password" class="input input-bordered w-13">
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

export default {
    name: "Signup",
    data(){
        return{
            email:"manuele.pasini@gmail.com",
            password:""
        }
    },
    methods: {
        signup:function() {
            if(this.email == "" && this.password ==""){
                console.log("empty")
            }else{
                api.signup(this.$socket,this.email,this.password,"berlin123")
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