import { createStore } from 'vuex'

export default createStore({
  state: {
    user: {
      username: "",
      mail: "",
      stars: 0,
      nationality: "",
      wins: 0,
      losses: 0,
      avatar: "",
    },
    token: "",
    in_game: false,
    authenticated:false
  },
    getters:{
    is_authenticated: state =>  state.authenticated,
    is_in_game: state => state.in_game
  },
  mutations: {
    setToken(state, token) {
      if(token !== 'null') {
          state.authenticated = true
          var tokenData = JSON.parse(atob(token.split('.')[1]));
          state.user = tokenData.user
          state.token = token
          //localStorage.token = token
         // axios.defaults.headers.common['Authorization'] = "bearer " + token;
      }
    },
    unsetToken(state) {
        state.authenticated = false
        state.user = {
          username: "",
          mail: "",
          stars: 0,
          nationality: "",
          wins: 0,
          losses: 0,
          avatar: "",
        };
        state.token = ""
        //axios.defaults.headers.common['Authorization'] = ""
    },
    setInGame(state,value){
      state.in_game = value
    }
  },
})
