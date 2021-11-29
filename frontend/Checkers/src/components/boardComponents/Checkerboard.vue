<template>
	<div class="content flex flex-col flex-grow">
    <appPlayer1 :player="player[1]"/>
		<!--<app-header @newGame="newGame"/>-->
		<div class="wrapper" @newGame="newGame">
			<div class="subwrapper">
				<div class="grid">
					<template v-for="(row, y) in game.board.grid">
						<appCell
							v-for="(cell, x) in row"
							:key="x+'-'+y"
							:x="x"
							:y="y"
							:cell="cell"
							:moves="cell.piece ? moves[cell.piece.getKey()] : {}"
							:size="getSize"
							@selectPiece="selectPiece"
							@selectCell="selectCell"/>
					</template>
				</div>
			</div>
		</div>
    <appPlayer0 :player="player[0]" class="elf-start"/>
	</div>
</template>

<script>
//import Header from 'Components/Header';
import Cell from '@/components/boardComponents/Cell';
import Player from '@/components/boardComponents/Player';
import GameManager from '@/helpers/game_manager'; 

export default {
  components: {
    //appHeader: Header,
    appCell: Cell,
    appPlayer1: Player,
    appPlayer0: Player
  },
  data(){
    GameManager.init();
    GameManager.addPieces();

    return {
      game           : GameManager,
      moves          : GameManager.getAllAvailableMoves(),
      targeted_cells : [],
      selected_piece : false,
      available_moves: {},
      player         : [],
    }
  },
  sockets: {
    player(data) {
      this.player = data
    }
  },
  computed: {
    getSize() {
      return "0 0 " + 100/this.game.board.size + "%";
    }
  },
  methods: {
    clearTargetedCells() {
      this.targeted_cells.forEach((key) => {
        GameManager.board.getCellAt(key[0], key[1]).targeted = false;
      });
      this.targeted_cells = [];
    },
    selectPiece(piece, moves) {
      // Untarget previous cells
      this.clearTargetedCells();

      if(this.selected_piece && this.selected_piece.x === piece.x && this.selected_piece.y === piece.y){
        // If already selected, just clear selected piece
        this.selected_piece = false;
        return;
      }

      const self           = this;
      this.available_moves = moves;
      this.selected_piece  = piece;

      // Target new cell
      if(moves){
        Object.keys(moves).forEach((key) => {
          key = key.split("_");
          self.targeted_cells.push([key[0], key[1]]);
          GameManager.board.getCellAt(key[0], key[1]).targeted = true;
        });
      }
    },
    selectCell(x, y) {
      const self  = this;
      const piece = GameManager.makeMove(this.selected_piece, x, y, this.available_moves[x + "_" + y]);

      const winners = GameManager.checkForVictory(this.moves);
      if(winners){
        const message = winners.length > 1 ? "Equality!" : "Player #" + winners[0] + " won the game!";
        this.$toasted.show(message, {
          theme   : "outline",
          icon    : "stars",
          position: "top-center",
          duration: 5000,
          action : {
          text : 'Play again?',
            onClick : (e, toastObject) => {
              toastObject.goAway(0);
              self.newGame();
            }
          },
        });
        return;
      }

      this.clearTargetedCells();
      this.moves = GameManager.getAllAvailableMoves();
      if(piece){
        this.selected_piece = false;
        this.selectPiece(piece, this.moves[piece.getKey()]);
      }

    },
    newGame() {
      console.log("ciao")
      GameManager.init();
      GameManager.addPieces();
      this.moves = GameManager.getAllAvailableMoves();
    },
    restore() {
      GameManager.restore();
      this.clearTargetedCells();
      this.moves = GameManager.getAllAvailableMoves();
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
 
