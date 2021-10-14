<template>
<div>
  <div class ="centralSpace">
    <Checkerboard class="board"/>
    <div class ="rightMenu">
      <b-button pill variant="success">Crea Lobby</b-button>
      <b-button pill variant="success">Unisciti a una lobby</b-button>
      <b-button pill variant="success">CPU</b-button>
      <b-button pill variant="success">Aggiungi amico</b-button>
      <b-button pill variant="success">Invita amico</b-button>
    </div>
  </div>
</div>
</template>

<script>
import Checkerboard from '@/components/Checkerboard'

export default {
  name: 'Home',
  components: {
    Checkerboard
  }
}
</script>

<style>
.centralSpace{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
}
.rightMenu {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 2;
}
.board {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 7;
  margin-right: 5%
}
.rightMenu button:not(:first-child) {
  margin-top: 10%;
}
</style>