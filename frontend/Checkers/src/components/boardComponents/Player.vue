<template>
    <div class>
        <div class="card lg:card-side pt-3">
        <img src="https://picsum.photos/id/1005/65" class="mask mask-square p-0.5">
        <div>
            <div class="flex p-2">
                <h2 class="card-title">Username</h2>
                <div class="avatar">
                    <div class="ml-1 rounded-btn w-10 h-10">
                        <img src="http://daisyui.com/tailwind-css-component-profile-1@40w.png">
                    </div>
                </div>
            </div> 
            <h3 class="text-left p-2">Punteggio</h3> 
        </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
       isReverse: { type: String, required: false } 
    },
    setup(props) {
       if(props.isReverse === "yes") {
          document.getElementsByClassName("grid")
       }
    }
}
</script>

<style scoped>
.grid {
    width: 50px;
    height: 70px;
}
</style>