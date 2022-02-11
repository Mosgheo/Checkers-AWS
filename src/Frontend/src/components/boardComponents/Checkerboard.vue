<template>
	<div class="content flex flex-col flex-grow max-w-screen-lg">
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
import Cell from '@/components/boardComponents/Cell'
import Player from '@/components/boardComponents/Player'
import { getCurrentInstance } from 'vue'
import store from '@/store'
import api from '../../../api.js'

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
      redPiece: require("@/assets/pieces/Red_Piece.png"),
      whitePiece: require("@/assets/pieces/White_Piece.png"),
      redKingPiece: require("@/assets/pieces/KRed_Piece.png"),
      whiteKingPiece: require("@/assets/pieces/KWhite_Piece.png"),
      board: grid,
      lobbyId: null,
      playerTurn: null,
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
      if(this.clickedCell === null && this.playerTurn === user.mail 
        && document.getElementById(""+cell).style.backgroundColor === "rgb(51, 51, 51)") {
        for(let i = 0; i < this.possibleMoves.length; i++) {
          if(this.possibleMoves[i].from === cell) {
            document.getElementById("" + this.possibleMoves[i].to).style.backgroundColor = "red"
          } else if((""+this.possibleMoves[i].from).includes("K")) {
            if((""+this.possibleMoves[i].from).substring(1) === this.cell) {
              if((""+this.possibleMoves[i].to).includes("K")) {
                document.getElementById(("" + this.possibleMoves[i].to).substring(1)).style.backgroundColor = "red"
              } else {
                document.getElementById("" + this.possibleMoves[i].to).style.backgroundColor = "red"
              }
            }
          }
        }
      } else if(this.clickedCell !== null && this.playerTurn === user.mail 
        && document.getElementById(""+cell).style.backgroundColor === "rgb(209, 213, 219)") {
        for(let i = 0; i < this.possibleMoves.length; i++) {
          if(this.possibleMoves[i].from === cell) {
            document.getElementById("" + this.possibleMoves[i].to).style.backgroundColor = "red"
          } else if((""+this.possibleMoves[i].from).includes("K")) {
            if((""+this.possibleMoves[i].from).substring(1) === this.cell) {
              if((""+this.possibleMoves[i].to).includes("K")) {
                document.getElementById(("" + this.possibleMoves[i].to).substring(1)).style.backgroundColor = "red"
              } else {
                document.getElementById("" + this.possibleMoves[i].to).style.backgroundColor = "red"
              }
            }
          }
        }
      }
    },
    release(cell) {
      var releaseCell = document.getElementById(""+cell)
      if(releaseCell.style.backgroundColor !== "rgb(51, 51, 51)" 
        && releaseCell.style.backgroundColor !== "rgb(209, 213, 219)"
        && this.playerTurn === user.mail) {
          releaseCell.style.backgroundColor = "black"
      }
      for(let i = 0; i < this.possibleMoves.length; i++) {
        if(this.possibleMoves[i].from === cell) {
          document.getElementById("" + this.possibleMoves[i].to).style.backgroundColor = "black"
        } else if((""+this.possibleMoves[i].from).includes("K")) {
          if((""+this.possibleMoves[i].from).substring(1) === this.cell) {
            if((""+this.possibleMoves[i].to).includes("K")) {
              document.getElementById(("" + this.possibleMoves[i].to).substring(1)).style.backgroundColor = "black"
            } else {
              document.getElementById("" + this.possibleMoves[i].to).style.backgroundColor = "black"
            }
          }
        }
      }
    },
    selectCell(cell) {
      if(this.playerTurn === user.mail) {
        if(cell === this.clickedCell) {
          appInstance.$MOVE_PIECE.play()
          this.clickedCell = null
          this.counterClick = 0
          document.getElementById("" + cell).style.backgroundColor = "rgb(51, 51, 51)"
        } else if(this.counterClick === 0 && document.getElementById(""+cell).style.backgroundColor === "rgb(51, 51, 51)") {
          appInstance.$MOVE_PIECE.play()
          this.clickedCell = cell
          this.counterClick++
          document.getElementById("" + cell).style.backgroundColor = "rgb(209, 213, 219)"
        } else {
          for(let i = 0; i < this.possibleMoves.length; i++) {
           if(this.possibleMoves[i].from === "K"+this.clickedCell && this.possibleMoves[i].to === cell) {
              appInstance.$MOVE_PIECE.play()
              api.move_piece(this.$socket, this.lobbyId, "K"+this.clickedCell, cell)
              document.getElementById("" + this.clickedCell).style.backgroundColor = "black"
              this.clickedCell = null
              this.counterClick = 0
              return;
            } else if(this.possibleMoves[i].from === this.clickedCell && this.possibleMoves[i].to === "K"+cell) {
              appInstance.$MOVE_PIECE.play()
              api.move_piece(this.$socket, this.lobbyId, this.clickedCell, "K"+cell)
              document.getElementById("" + this.clickedCell).style.backgroundColor = "black"
              this.clickedCell = null
              this.counterClick = 0
              return;
            } else if(this.possibleMoves[i].from === this.clickedCell && this.possibleMoves[i].to === cell) {
              appInstance.$MOVE_PIECE.play()
              api.move_piece(this.$socket, this.lobbyId, this.clickedCell, cell)
              document.getElementById("" + this.clickedCell).style.backgroundColor = "black"
              this.clickedCell = null
              this.counterClick = 0
              return;
            }
          }
          if(this.clickedCell !== null) {
            appInstance.$MOVE_PIECE.play()
            document.getElementById("" + this.clickedCell).style.backgroundColor = "rgb(51, 51, 51)"
          }
          this.clickedCell = null
          this.counterClick = 0
        }
      }
    },
    checkPossibleEat() {
      var possibleEat = []
      for(const [key, value] of Object.entries(this.myMoves)) {
        if(key && value.length !== 0) {
          for(let i = 0; i < value.length; i++) {
            if(value[i].piecesTaken !== undefined) {
              possibleEat.push(value[i])
            }
          }
        }
      }
      return possibleEat
    },
    colorCells() {
      for(const [key] of Object.entries(this.myMoves)) {
        if(key.toString().includes("K")) {
          document.getElementById("" + key.substring(1)).style.backgroundColor = "black"
        } else {
          document.getElementById("" + key).style.backgroundColor = "black"
        }
      }
      if(this.playerTurn === user.mail) {
        var possibleEat = this.checkPossibleEat()
        if(possibleEat.length > 0) {
          for(let i = 0; i < possibleEat.length; i++) {
            if((""+possibleEat[i].from).includes("K")) {
              document.getElementById("" + possibleEat[i].from.substring(1)).style.backgroundColor = "#333333"
            } else {
              document.getElementById("" + possibleEat[i].from).style.backgroundColor = "#333333"
            }
          }
          return
        }
        for(const [key, value] of Object.entries(this.myMoves)) {
          if(key && value.length !== 0) {
            for(let i = 0; i < value.length; i++) {
              document.getElementById("" + value[i].from).style.backgroundColor = "#333333"
            }
          }
        }
      }
    }
  },
  sockets: {
    game_started(res) {
      console.log(res)
      this.player1 = res[0]
      this.player2 = res[1]
      if(this.player1.username === user.username) {
        this.playerTurn = user.mail
        this.myMoves = res[2].board[1]
      } else {
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

      this.lobbyId = res[3]

      this.colorCells()
    },
    update_board(res) {
      var cells = Array.from((document.getElementsByClassName("grid")[0]).children).filter(el => el.id !== "0")
      for(let i = 0; i < cells.length; i++) {
        if(cells[i].children.length > 0) {
          (cells[i].children[0]).remove()
        }
        var piece = document.createElement('img');
        piece.className = "ease-out duration-300"
        if(("K"+cells[i].id) in res[2]) {
          piece.src = this.redKingPiece
          cells[i].appendChild(piece)
        } else if(cells[i].id in res[2]) {
          piece.src = this.redPiece;
          cells[i].appendChild(piece)
        } else if(("K"+cells[i].id) in res[1]) {
          piece.src = this.whiteKingPiece
          cells[i].appendChild(piece)
        } else if(cells[i].id in res[1]) {
          piece.src = this.whitePiece;
          cells[i].appendChild(piece)
        }
      }

      if(this.player1.username === user.username) {
        this.myMoves = res[1]
      } else {
        this.myMoves = res[2]
      }

      this.possibleMoves = []
      for(const [key, value] of Object.entries(this.myMoves)) {
        if(key && value.length !== 0) {
          for(let i = 0; i < value.length; i++) {
            this.possibleMoves.push(value[i])
          }
        }
      }
    },
    turn_change(res) {
      this.playerTurn = res.next_player
      this.colorCells()
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
  max-width: 65em;
  min-width: 450px;
}

@media only screen and (max-width: 500px) {
  .grid {
    min-width: 425px;
  }
}
</style>
 
