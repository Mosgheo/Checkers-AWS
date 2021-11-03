export default class Player {

	constructor(options) {
		console.log("Creating player " + options.id)
		options            = options || {};
		this.id            = options.id;
		this.pieces        = [];
		this.selected_cell = false;
	}

	addPiece(piece){
		piece.player_id = this.id;
		console.log("add piece to player " + this.id)
		this.pieces.push(piece);
	}
}