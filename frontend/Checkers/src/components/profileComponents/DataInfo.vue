<template>
  <b-form @submit.prevent="handleSubmit">

    <b-form-group label="Username">
        <b-form-input
          type="text"
          v-model="user.name"
          placeholder="Nome Utente">
        </b-form-input>
    </b-form-group>

    <b-form-group label="Nome">
        <b-form-input
          type="text"
          v-model="user.name"
          placeholder="Nome">
        </b-form-input>
    </b-form-group>

    <b-form-group label="Cognome">
        <b-form-input
          type="text"
          v-model="user.name"
          placeholder="Cognome">
        </b-form-input>
    </b-form-group>

    <b-form-group label="Email">
        <b-form-input
          type="email"
          v-model="user.email"
          placeholder="Email">
        </b-form-input>
    </b-form-group>

    <b-form-group label="Mobile">
        <b-form-input
          type="text"
          v-model="user.mobile"
          placeholder="Mobile">
        </b-form-input>
    </b-form-group>

    <b-form-group label="City">
      <b-form-select v-model="user.city">
        <option value="">Seleziona una località</option>
        <option value="CA">Los Angeles</option>
        <option value="IL">Chicago</option>
        <option value="LA">New Orleans</option>
        <option value="NM">Santa Fe</option>
      </b-form-select>
    </b-form-group>

    <b-form-group label="Password">      
        <b-form-input v-model="user.password" type="password" placeholder="Password">
        </b-form-input>
    </b-form-group>

    <!--<b-form-group>
      <b-form-checkbox-group v-model="user.hobbies">
        <b-form-checkbox value="Reading">Reading</b-form-checkbox>
        <b-form-checkbox value="Gyming">Gyming</b-form-checkbox>
        <b-form-checkbox value="Movies">Movies</b-form-checkbox>
      </b-form-checkbox-group>
    </b-form-group>-->

    <b-button block type="submit" variant="primary">Modifica</b-button>
  </b-form>
</template>

<script>
export default {
  data: () => ({
    user:{
        name: '',
        email: '',
        mobile: '',
        city: '',
        password: '',
        confirmation: '',
        hobbies: []
    }
  }),
  methods: {
    handleSubmit () {
      console.log(this.user);
    }
  }
};
</script>

<style>
form input { 
  text-align: left;
}

form button, form select, form input {
  margin-top: 2%;
}

.col-form-label {
    font-weight: 600;
}
</style>

