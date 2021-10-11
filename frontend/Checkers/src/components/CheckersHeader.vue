<template>
  <header>
    <router-link to="/"><img src="../assets/logo.png" height="100"/></router-link>
    <nav>
      <ul>
        <li><div v-if="!$auth.loading.value">
          <button v-if="!$auth.isAuthenticated.value" @click="login">Log in</button>
          <button v-if="$auth.isAuthenticated.value" @click="logout">Log out</button>
        </div></li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'Header',
    methods: {
    login() {
      this.$auth.loginWithRedirect();
    },
    // Log the user out
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      });
    }
  }
}
</script>

<style>
header {
	display: flex;
	border-bottom: 1px solid #ccc;
	padding: 0rem 1rem;
}
 header p {
	margin-left: 1rem;
}
 nav {
	margin-left: auto;
}
 nav ul {
	list-style: none;
}
 nav ul li {
	display: inline-flex;
  margin-left: 1rem;
}
</style>