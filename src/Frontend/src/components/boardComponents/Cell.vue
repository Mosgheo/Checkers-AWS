<!-- This file represent the Cell component -->
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
      <div v-if="this.cell <= 20">
          <img class="ease-in-out duration-300" src="@/assets/pieces/Red_Piece.png" alt="Red Piece Image" />
      </div>
      <div v-else-if="this.cell >= 31">
          <img class="ease-in-out duration-300" src="@/assets/pieces/White_Piece.png" alt="White Piece Image" />
      </div>
		</template>
	</div>
</template>

<script>
import { getCurrentInstance } from 'vue'

var appInstance = null

export default {
  props: ['cell', 'size', 'x', 'y', 'moves', 'myMoves'],
  setup() {
    appInstance = getCurrentInstance()
  },
  methods: {
    // When a cell is clicked, send an emit to the parent
    selectCell() {
      if(this.cell > 0) {
        this.$emit("selectCell", this.cell);
      }
    },
    // When mouse is hover cell, emit it to the parent if the cell contains a piece
    hoverCell() {
      if(("K"+this.cell in this.myMoves && this.myMoves["K"+this.cell].length > 0)
          || (this.cell in this.myMoves && this.myMoves[this.cell].length > 0)) {
        this.$emit("hover-cell", this.cell)
      }
    },
    // When mouse live a cell, emit it to the parent
		leaveCell() {
      if(this.cell !== 0) {
        this.$emit("release", this.cell)
      }
    }
  },
  computed: {
    // Give the specific class to the cell
    getClasses() {
      const classes = [];
      if((this.x + this.y) % 2) {
        classes.push(appInstance.appContext.config.globalProperties.$COLOR_BOTTOM);
      } else {
        classes.push(appInstance.appContext.config.globalProperties.$COLOR_TOP);
      }
      return classes;
    },
    // Style the cell into the grid
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
</style>