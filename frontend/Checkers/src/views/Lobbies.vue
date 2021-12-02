<template>
  <div class="lobbies overflow-x-auto">
    <table class="table w-full">
      <thead>
        <tr>
          <th>Lobby Owner</th> 
          <th>Name Lobby</th> 
          <th>Max stars</th>
          <th>Join</th>
        </tr>
      </thead> 
      <tbody v-for="(lobby, index) in res" :key="index">
        <tr>
          <td :textContent="lobby.host"></td> 
          <td :textContent="lobby.name"></td> 
          <td :textContent="lobby.max_stars"></td>
          <td><button class="btn">Join Lobby</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "Lobbies",
  data() {
    return {
      res: []
    }
  },
  sockets: {
    lobbies(res) {
      this.res = res
    }
  }
}
</script>

<style scoped>
.lobbies {
  padding: 3.8em 3.8em 2em 15em
}
</style>