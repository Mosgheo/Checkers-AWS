<template>
	<!--<div
		:class="[piece.player_id, piece.type]"
		class="piece"
		@click="selectPiece">
		<img
			v-if="isKing"
			src="@/assets/logo.png">
	</div>-->
    <div v-if="this.piece <= 20" @click="selectPiece">
        B
        <!--<div class="piece pieceOne">
            <img v-if="isKing" src="@/assets/logo.png" />
        </div>-->
    </div>
    <div v-else-if="this.piece >= 31" @click="selectPiece">
        W
        <!--<div class="piece pieceTwo">
            <img v-if="isKing" src="@/assets/logo.png" />
        </div>-->
    </div>
</template>

<script>
import '@/assets/logo.png';
//import { getCurrentInstance } from 'vue'

//var appInstance = null


export default {
    props: ['piece'],
    setup() {
        //appInstance = getCurrentInstance().appContext.config.globalProperties
    },
    computed: {
        isKing() {
            return false//this.piece.type === appInstance.$PIECE_TYPE_KING;
        }
    },
    methods: {
        selectPiece() {
            this.$emit("selectPiece");
        }
    }
}
</script>

<style scoped>
.piece {
    align-self: center;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 75%;
    height: 75%;
}
.pieceOne {
    background-color: #D9CAB3;
}
.pieceTwo {
    background-color: #a30010;
}
.piece img {
    width: 75%;
    height: 75%;
}
</style>