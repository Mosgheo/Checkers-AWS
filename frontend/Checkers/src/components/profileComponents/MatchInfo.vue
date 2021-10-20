<template>
  <div>
    <b-table striped hover :items="items"></b-table>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        items: [
          { durata: 40, avversario: 'Dickerson', esito: 'Vittoria', punteggio: '200' },
          { durata: 21, avversario: 'Larsen', esito: 'Vittoria', punteggio: '130' },
          { durata: 89, avversario: 'Geneva', esito: 'Sconfitta', punteggio: '30' },
          { durata: 38, avversario: 'Jami', esito: 'Sconfitta', punteggio: '25' }
        ]
      }
    }
  }
</script>