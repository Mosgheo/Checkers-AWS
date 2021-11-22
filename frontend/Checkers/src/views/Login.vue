<template>
    <div class="card shadow-lg">
        <div class="card-body items-center">
            <div class="form-control rounded-lg items-center">

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-2">Nome utente</span>
                    </label> 
                    <input type="text" placeholder="Inserisci nome utente" class="input input-bordered w-13">
                </div>

                <div class="block">
                    <label class="label">
                        <span class="label-text mt-2">Password</span>
                    </label> 
                    <input type="password" placeholder="Inserisci la password" class="input input-bordered w-13">
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
export default {
    name: "Login",
    methods: {
        login() {
            console.log("ciao")
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