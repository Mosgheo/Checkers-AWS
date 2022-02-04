<template>
    <div class="chat-div flex flex-col form-control">
        <textarea class="chat textarea textarea-bordered" placeholder="Chat di gioco"></textarea>
        <textarea class="message textarea textarea-bordered normal-case" v-on:keyup.enter="onEnter()" placeholder="Type here..."></textarea>
    </div>
</template>

<script>
import store from '@/store'
import api from '../../../api.js'

var message = document.getElementsByClassName("message");
var chat = document.getElementsByClassName("chat")
export default {
    name: "GameChat",
    props: ['lobbyId'],
    methods: {
        onEnter() {
            var msg = store.state.user.username + " => " +  message[0].value
            chat[1].value += msg
            message[0].value = ""
            api.game_msg(this.$socket, this.lobbyId, msg)
        }
    },
    sockets: {
        game_msg(msg) {
            if(msg.sender !== store.getters.user.mail) {
                chat[1].value += msg.message
            }
            console.log(msg)
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
@media only screen and (max-width: 650px) {
    .chat-div {
        flex-direction: row;
    }
    .message {
        margin-left: 1rem;
        margin-top: 0;
        min-width: 10rem;
    }
    .chat {
        min-width: 15rem;
    }
}
</style>