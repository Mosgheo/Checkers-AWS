<!--<template>
	<div
		:class="getClasses"
		class="cell"
		:style="{flex: size}"
		@click="selectCell">
		<template v-if="this.cell !== 0">
			<Piece
				:piece="cell.piece"
				@selectPiece="selectPiece"/>
		</template>
	</div>
</template>-->
<template>
	<div
		:class="getClasses"
    :id="this.cell"
		class="cell"
		:style="{flex: size}"
		@click="selectCell" 
    @mouseover="hoverCell"
    @mouseleave="leaveCell" >
		<template v-if="this.cell in this.moves">
			<Piece :piece="this.cell" @selectPiece="selectPiece" />
		</template>
	</div>
</template>

<script>
import Piece from '@/components/boardComponents/Piece.vue'
import { getCurrentInstance } from 'vue'

var appInstance = null

export default {
  props: ['cell', 'size', 'x', 'y', 'moves', 'myMoves'],
  components: {
    Piece
  },
  setup() {
    appInstance = getCurrentInstance()
  },
  methods: {
    selectPiece() {
      this.$emit("selectPiece", this.cell.piece, this.myMoves);
    },
    selectCell() {
      if(this.cell > 0) {
        this.$emit("selectCell", this.cell);
      }
    },
    hoverCell() {
      if(("K"+this.cell in this.myMoves && this.myMoves["K"+this.cell].length > 0)
          || (this.cell in this.myMoves && this.myMoves[this.cell].length > 0)) {
        this.$emit("hover-cell", this.cell)
      }
    },
		leaveCell() {
      if(this.cell !== 0) {
        this.$emit("release", this.cell)
      }
    }
  },
  computed: {
    getClasses() {
      const classes = [];
      if((this.x + this.y) % 2) {
        classes.push(appInstance.appContext.config.globalProperties.$COLOR_BOTTOM);
      } else {
        classes.push(appInstance.appContext.config.globalProperties.$COLOR_TOP);
      }
      /*if(this.myMoves && Object.keys(this.myMoves).length) {
        classes.push('selected');
      }
      if(this.cell.targeted) {
        classes.push('targeted');
      }*/
      return classes;
    },
    style() {
      return {
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