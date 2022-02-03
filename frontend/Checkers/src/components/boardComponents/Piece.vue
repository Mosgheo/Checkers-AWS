<template>
    <div v-if="this.piece <= 20">
        <img class="ease-in-out duration-300" src="@/assets/pieces/Red_Piece.png" />
    </div>
    <div v-else-if="this.piece >= 31">
        <img class="ease-in-out duration-300" src="@/assets/pieces/White_Piece.png" />
    </div>
</template>

<script>
import '@/assets/logo.png';


export default {
    props: ['piece'],
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