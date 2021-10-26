<template>
  <div>
    <b-table
      id="table-transition-example"
      :items="items"
      :fields="fields"
      striped
      hover
      primary-key="Posizione"
      :tbody-transition-props="transProps"
    ></b-table>
  </div>
</template>

<script>
export default {
    data() {
        return {
            transProps: {
                // Transition name
                name: 'flip-list'
            },
            fields: [
                { key: 'Posizione', label:'Posizione', sortable: true },
                { key: 'Username', label:'Username', sortable: true },
                { key: 'Punteggio', label:'Punteggio', sortable: true },
                { key: 'PG', label:'PG', sortable: true },
                { key: 'Vittorie', label:'Vittorie', sortable: true },
                { key: 'Sconfitte', label:'Sconfitte', sortable: true },
            ],
            items: [
                { Posizione: '#1', Username: 'One', Punteggio: 2000, PG: 200, Vittorie: 190, Sconfitte: 10 },
                { Posizione: '#2', Username: 'Two', Punteggio: 1900, PG: 200, Vittorie: 185, Sconfitte: 15 },
                { Posizione: '#3', Username: 'Three', Punteggio: 1850, PG: 200, Vittorie: 170, Sconfitte: 30 },
                { Posizione: '#4', Username: 'Four', Punteggio: 1830, PG: 200, Vittorie: 165, Sconfitte: 35 }
            ]
        }
    }
}
</script>

<style>
table {
    margin-top: 1%;
}
table#table-transition-example .flip-list-move {
    transition: transform 1s;
}
</style>