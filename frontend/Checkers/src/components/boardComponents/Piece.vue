<template>
	<div
		:class="[piece.player_id, piece.type]"
		class="piece"
		@click="selectPiece">
		<img
			v-if="isKing"
			src="@/assets/logo.png">
	</div>
</template>

<script>
import '@/assets/logo.png';
import { getCurrentInstance } from 'vue'

var appInstance = null


export default {
    props: ['piece'],
    methods: {
        selectPiece(){
            this.$emit("selectPiece");
        }
    },
    setup() {
        appInstance = getCurrentInstance().appContext.config.globalProperties
    },
    computed: {
        isKing(){
            return this.piece.type === appInstance.$PIECE_TYPE_KING;
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
.piece.one {
    background-color: #D9CAB3;
}
.piece.two {
    background-color: #a30010;
}
.piece img {
    width: 75%;
    height: 75%;
}
</style>