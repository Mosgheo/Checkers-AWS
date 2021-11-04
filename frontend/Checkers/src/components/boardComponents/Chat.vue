<template>
   <div class="grid grid-flow-col auto-cols-max">
      <div class="form-control">
         <textarea class="chat textarea textarea-bordered" placeholder="Chat di gioco"></textarea>
         <textarea class="message textarea textarea-bordered" v-on:keyup.enter="onEnter()" placeholder="Type here..."></textarea>
      </div>
   </div>
</template>

<script>
var message = document.getElementsByClassName("message");
var chat = document.getElementsByClassName("chat")
export default {
    methods: {
        onEnter() {
            chat[1].value += message[0].value
            message[0].value = ""
        }
    }
}
</script>

<style scoped>
textarea {
    max-width: 30em;
    width: 20em;
    background-color: #1F1E1E;;
}

.chat {
    max-height: 50em;
    height: 50em;
}

.message {
    margin-top: 3.5em;
    max-height: 12.5em;
    height: 12.5em;
}
</style>