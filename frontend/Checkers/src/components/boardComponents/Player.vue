<template>
    <div class="player">
        <div class="card lg:card-side flex flex-row pt-3">
            <img src="https://picsum.photos/id/1005/800" class="profileImg mask mask-square p-0.5">
            <div class="flex-row">
                <div class="flex flex-row">
                    <h2 class="card-title ml-1.5">Username</h2>
                    <div class="avatar">
                        <div class="ml-1 rounded-btn">
                            <img class="nationImg" src="http://daisyui.com/tailwind-css-component-profile-1@40w.png">
                        </div>
                    </div>
                </div> 
                <h3 class="text-left p-2">Punteggio</h3> 
            </div>
        </div>
    </div>
</template>

<script>
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