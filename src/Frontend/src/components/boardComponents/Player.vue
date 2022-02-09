<template>
    <div class="player">
        <div class="card lg:card-side flex flex-row pt-3" >
            <img :src="this.player.avatar" alt="User's Avatar" class="profileImg mask mask-square p-0.5" />
            <div class="flex-col">
                <p class="card-title ml-1" :innerText="this.player.username">Username</p>
                <div class="flex flex-row">
                    <i class="fas fa-star" />
                    <p class="text-left font-semibold text-base ml-1" :innerText="this.player.stars">Stars</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import store from '@/store'

export default {
    name: 'Player',
    props: ['player'],
}
</script>

<style scoped>
.player {
    height: 5em;
    width: 12em;
}

.profileImg {
    max-height: 4em;
    max-width: 4em;
}
</style>