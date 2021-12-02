import Util from '@/helpers/util'
import { app } from '@/main.js';

var appInstanceGlobalVar = null;

export default class Piece {

	constructor(options) {
		appInstanceGlobalVar = app.config.globalProperties
		options        = options || {};
		this.player_id = options.player_id;
		this.type      = options.type || appInstanceGlobalVar.$PIECE_TYPE_MAN;
		this.x         = options.x;
		this.y         = options.y;
	}

	isKing(){
		return this.type === appInstanceGlobalVar.$PIECE_TYPE_KING;
	}

	getKey(){
		return Util.getKey(this);
	}

}