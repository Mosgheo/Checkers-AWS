<template>
  <div>
    <beautiful-chat
      :participants="participants"
      :onMessageWasSent="sendMessage"
      :messageList="messageList"
      :newMessagesCount="newMessagesCount"
      :isOpen="this.isChatOpen"
      :close="closeChat"
      :open="openChat"
      :showEdition="true"
      :showDeletion="true"
      :deletionConfirmation="true"
      :showTypingIndicator="showTypingIndicator"
      :showLauncher="true"
      :colors="colors"
      :alwaysScrollToBottom="alwaysScrollToBottom"
      :disableUserListToggle="false"
      :messageStyling="messageStyling"
      @edit="editMessage" />
  </div>
</template>

<script>
import store from '@/store'
import api from '@/../api.js'

export default {
  name: 'app',
  props: ['opponent', 'lobbyId'],
  data() {
    return {
      participants: [
        {
          id: "",
          name: "",
          imageUrl: ""
        },
      ], // the list of all the participant of the conversation. `name` is the user name, `id` is used to establish the author of a message, `imageUrl` is supposed to be the user avatar.
      messageList: [], // the list of the messages to show, can be paginated and adjusted dynamically
      newMessagesCount: 0,
      isChatOpen: true, // to determine whether the chat window should be open or closed
      showTypingIndicator: '', // when set to a value matching the participant.id it shows the typing indicator for the specific user
      colors: {
        header: {
          bg: '#1F1E1E',
          text: '#ffffff'
        },
        launcher: {
          bg: '#1F1E1E',
          text: '#ffffff'
        },
        messageList: {
          bg: '#ffffff',
        },
        sentMessage: {
          bg: '#306844',
          text: '#ffffff'
        },
        receivedMessage: {
          bg: "#343232",
          text: '#ffffff'
        },
        userInput: {
          bg: '#343232',
          text: '#ffffff'
        }
      }, // specifies the color scheme for the component
      alwaysScrollToBottom: false, 
      messageStyling: true 
    }
  },
  methods: {
    sendMessage(message) {
      if(message.data.text.length > 0) {
        this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1
        api.game_msg(this.$socket, this.lobbyId, message.data.text)
        this.onMessageWasSent(message)
      }
    },
    onMessageWasSent(message) {
      // called when the user sends a message
      this.messageList = [ ...this.messageList, message ]
    },
    openChat() {
      // called when the user clicks on the fab button to open the chat
      this.isChatOpen = true
      this.newMessagesCount = 0
    },
    closeChat() {
      // called when the user clicks on the botton to close the chat
      this.isChatOpen = false
    },
    editMessage(message) {
      const m = this.messageList.find(m=>m.id === message.id);
      m.isEdited = true;
      m.data.text = message.data.text;
    }
  },
  sockets: {
    game_msg(msg) {
        if(this.participants[0].id === "") {
            this.participants[0].id = this.opponent.mail
            this.participants[0].name = this.opponent.username
            this.participants[0].imageUrl = this.opponent.avatar
        }
        var text = this.participants[0].name.toUpperCase() + ": " + msg.message
        if(msg.sender !== store.getters.user.mail) {
            this.onMessageWasSent({type: 'text', author: this.participants[0].mail, data: {text}})
        }
    }
  }
}
</script>

<style>
.sc-header--title {
    display: none;
}
.sc-header--close-button {
    display: none;
}
.sc-message--avatar {
    padding: 1rem;
}
</style>