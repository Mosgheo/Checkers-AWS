<template>
	<div class="content flex flex-col flex-grow">
    <appPlayer1 :player="this.player2"/>
		<div class="wrapper">
			<div class="subwrapper">
				<div class="grid">
          <template v-for="(row, y) in this.board">
            <appCell 
              v-for="(cell, x) in row"
              :key="x+'-'+y"
              :x="x"
							:y="y"
              :cell="cell"
              :myMoves="this.myMoves"
              :moves="this.moves"
              :size="getSize"
              @hover-cell="checkMoves"
              @release="release" 
              @selectCell="selectCell"/>
          </template>
				</div>
			</div>
		</div>
    <appPlayer0 :player="this.player1" class="self-start"/>
	</div>
</template>

<script>
import Cell from '@/components/boardComponents/Cell';
import Player from '@/components/boardComponents/Player';
import { getCurrentInstance } from 'vue'
import store from '@/store'

var user = null

var appInstance = null

export default {
  components: {
    appCell: Cell,
    appPlayer1: Player,
    appPlayer0: Player
  },
  setup() {
    appInstance = getCurrentInstance().appContext.config.globalProperties
    user = store.getters.user
  },
  data() {
    let grid = []
    var cell = 1
    for(let i = 0; i < appInstance.$BOARD_SIZE; i++) {
      let row = []
      for(let j = 0; j < appInstance.$BOARD_SIZE; j++) {
        if((i+1) % 2 == 0) {
          if((j+1) % 2 != 0) {
            row[j] = cell
            cell++
          } else {
            row[j] = 0
          }
        } else {
          if((j+1) % 2 == 0) {
            row[j] = cell
            cell++
          } else {
            row[j] = 0
          }
        }
        
      }
      grid.push(row)
    }

    return {
      board: grid,
      playerId: null,
      moves: [],
      myMoves: [],
      possibleMoves: [],
      player1: [],
      player2: [],
      clickedCell: null,
      counterClick: 0
    }
  },
  computed: {
    getSize() {
      return "0 0 " + 100/appInstance.$BOARD_SIZE + "%";
    }
  },
  methods: {
    checkMoves(cell) {
      for(let i = 0; i < this.possibleMoves.length; i++) {
        if(this.possibleMoves[i].from === cell) {
          var possibleMove = document.getElementById("" + this.possibleMoves[i].to)
          possibleMove.style.backgroundColor = "red"
        }
      }
    },
    release(cell) {
      for(let i = 0; i < this.possibleMoves.length; i++) {
        if(this.possibleMoves[i].from === cell) {
          var possibleMove = document.getElementById("" + this.possibleMoves[i].to)
          possibleMove.style.backgroundColor = "black"
        }
      }
    },
    selectCell(cell) {
      if(cell === this.clickedCell) {
        this.clickedCell = null
        this.counterClick = 0
        this.release(cell)
      } else if(this.counterClick === 0) {
        console.log(cell)
        this.clickedCell = cell
        this.counterClick++
      } else {
        var cellWithPiece = document.getElementById(this.clickedCell)
        var cellWithoutPiece = document.getElementById("" + cell)
        var piece = (cellWithPiece.children)[0]
        for(let i = 0; i < this.possibleMoves.length; i++) {
          if(this.possibleMoves[i].from === this.clickedCell && this.possibleMoves[i].to === cell) {
            cellWithPiece.removeChild(piece)
            cellWithoutPiece.appendChild(piece)
            break;
          }
        }
        this.clickedCell = null
        this.counterClick = 0
      }
    }
  },
  sockets: {
    token_error(error) {
      console.log(error)
    },
    game_started(res) {
      console.log(res)
      this.player1 = res[0]
      this.player2 = res[1]
      if(this.player1.username === user.username) {
        this.playerId = 1
        this.myMoves = res[2].board[1]
      } else {
        this.playerId = 2
        this.myMoves = res[2].board[2]
      }
      this.moves = {...res[2].board[1], ...res[2].board[2]}

      this.possibleMoves = []
      for(const [key, value] of Object.entries(this.myMoves)) {
        if(key && value.length !== 0) {
          for(let i = 0; i < value.length; i++) {
            this.possibleMoves.push(value[i])
          }
        }
      }
    },
    permit_error(error) {
      console.log(error)
    }
  }
}
</script>

<style scoped>
.content .wrapper {
  display: flex;
  width: 100%;
  height: calc(100% - 60px);
  align-items: center;
}

.content .wrapper .subwrapper {
  display: flex;
  width: 100%;
}

.content .wrapper .subwrapper .grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  border: 2px solid black;
}

.grid {
  max-width: 53.9em;
  min-width: 450px;
}
</style>
 
