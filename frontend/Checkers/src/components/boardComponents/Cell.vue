<!--<template>
    <span class="checkerSquare"></span>
</template>-->
<template>
	<div
		:class="getClasses"
		class="cell"
		:style="{flex: size}"
		@click="selectCell">
		<template v-if="cell.piece">
			<Piece
				:piece="cell.piece"
				@selectPiece="selectPiece"/>
		</template>
	</div>
</template>

<script>
import Piece from '@/components/boardComponents/Piece.vue'
import { getCurrentInstance } from 'vue'

var appInstance = null

export default {
  props: ['cell', 'size', 'x', 'y', 'moves'],
  components: {
    Piece
  },
  setup() {
    appInstance = getCurrentInstance()
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
    },
    selectPiece(){
      this.$emit("selectPiece", this.cell.piece, this.moves);
    },
    selectCell(){
      if(this.cell.targeted){
        this.$emit("selectCell", this.x, this.y);
      }
    }
		
  },
  computed: {
    getClasses(){
      const classes = [];
      if((this.x + this.y) % 2) {
        classes.push(appInstance.appContext.config.globalProperties.$COLOR_BOTTOM);
      } else {
        classes.push(appInstance.appContext.config.globalProperties.$COLOR_TOP);
      }
      if(this.moves && Object.keys(this.moves).length) {
        classes.push('selected');
      }
      if(this.cell.targeted) {
        classes.push('targeted');
      }
      return classes;
    }
    /*style() {
      return {
        backgroundColor: this.getColor(),
        width: '50px',
        height: '50px',
        display: 'inline-block',
        border: 'solid black 1px',
        marginRight: '0px',
        marginTop: '-3px'
      };
    }*/
  }
}
</script>

<style scoped>
.cell {
  display: flex;
  justify-content: center;
  align-items: stretch;
}
.cell:before {
  content: '';
  display: table;
  padding-top: 100%;
}
.cell.color-top {
  background-color: #583E23;
}
.cell.color-bottom {
  background-color: black;
}
.cell.selected {
  background-color: yellow;
}
.cell.selected .piece {
  cursor: pointer;
}
.cell.targeted {
  background-color: #075851;
  cursor: pointer;
}
</style>