<template>
    <div class="flex flex-col form-control">
        <textarea class="chat textarea textarea-bordered" placeholder="Chat di gioco"></textarea>
        <textarea class="message textarea textarea-bordered" v-on:keyup.enter="onEnter()" placeholder="Type here..."></textarea>
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
    width: 20em;
    background-color: #1F1E1E;;
}

.chat {
    max-height: 50em;
    height: 50em;
}

.message {
    margin-top: 5em;
    max-height: 12.5em;
    height: 12.5em;
}

@media (max-width: 1900px) {
    textarea {
        max-width: 15em;
    }

    .message {
        margin: 1em 0em;
        max-height: 20em;
    }
}

@media (max-width: 1800px) {
    .chat {
        max-height: 30em;
    }
}

@media (max-width: 1250px) {
    .chat {
        max-height: 25em;
    }
}

@media (max-width: 900px) {
    textarea {
        width: 10em;
    }
}
</style>