<template>
    <span class="checkerSquare"></span>
</template>

<script>
//import Piece from '@/components/Piece.vue'
export default {
    props:['row', 'col'],
    components: {
        //Piece
    },
    data() {
    return {
      //piece: null,
    }
  },
    methods: {
          getColor() {
            if ((Number(this.row) + Number(this.col)) % 2 == 0) {
              return 'white';
            } else {
              return 'black';
            }
          }
        },
    computed: {
          style() {
            return {
              backgroundColor: this.getColor(),
              width: '50px',
              height: '50px',
              display: 'inline-block',
              border: 'solid black 1px',
              marginRight: '0px',
              marginTop: '-3px'
            };
          }
        }
}
</script>