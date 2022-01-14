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

    <input type="checkbox" id="join-lobby-modal" class="modal-toggle"> 
    <div class="exit-lobby modal modal-close">
      <div class="modal-box items-center">
        <div class="form-control items-center">
          <label class="mt-3">
            <span>"The opponent has left the game! Now you will be redirect to Home page and
                  100 stars have been added to your profile"</span>
          </label> 
        </div>
        <div class="flex flex-row modal-action justify-center">
          <label @click.prevent="confirmButton" for="join-lobby-modal" class="accept btn">
            Ok
          </label>
        </div>
      </div>
    </div>
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
      if(this.playerTurn === user.mail) {
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
          var piece = cellWithPiece.innerText
          for(let i = 0; i < this.possibleMoves.length; i++) {
            if(this.possibleMoves[i].from === this.clickedCell && this.possibleMoves[i].to === cell) {
              cellWithoutPiece.innerText = piece
              cellWithPiece.innerText = ""
              api.move_piece(this.$socket, this.lobbyId, this.clickedCell, cell)
              break;
            }
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
        document.getElementById("" + key).style.backgroundColor = "black"
      }
      if(this.playerTurn === user.mail) {
        var possibleEat = this.checkPossibleEat()
        if(possibleEat.length > 0) {
          possibleEat.forEach(move => document.getElementById("" + move.from).style.backgroundColor = "#333333")
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
    },
    confirmButton() {
      var exitLobbyModal = document.getElementsByClassName("exit-lobby")[0]
      exitLobbyModal.setAttribute("class", "exit-lobby modal modal-close")
      this.$router.push("/")
    }
  },
  sockets: {
    token_error(error) {
      console.log(error)
    },
    game_started(res) {
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
      store.state.in_game = true

      this.colorCells()
    },
    permit_error(error) {
      console.log(error)
    },
    update_board(res) {
      console.log(res[1])
      console.log(res[2])

      var cells = Array.from((document.getElementsByClassName("grid")[0]).children)
      for(let i = 0; i < cells.length; i++) {
        if(cells[i].id in res[2]) {
          if(cells[i].children.length > 0) {
            (cells[i].children[0]).remove()
          }
          cells[i].innerText = "B"
        } else if(cells[i].id in res[1]) {
          if(cells[i].children.length > 0) {
            (cells[i].children[0]).remove()
          }
          cells[i].innerText = "W"
        } else {
          if(cells[i].children.length > 0) {
            (cells[i].children[0]).remove()
          }
          cells[i].innerText = ""
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
    },
    left_game(res) {
      console.log(res)
    },
    opponent_left(msg) {
      console.log(msg)
      store.state.in_game = false
      var exitLobbyModal = document.getElementsByClassName("exit-lobby")[0]
      exitLobbyModal.setAttribute("class", "exit-lobby modal modal-open")
    },
    game_ended(msg) {
      console.log("HELLO RECEIVED END GAME")
      console.log(msg)
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
 
