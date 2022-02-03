const game_service = require('../index')
const Game = require('../models/gameModel')

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');

const game_id = 1
const host = "host@gmail.com"
const opponent = "opponent@gmail.com"

chai.use(chaiHttp);
chai.should();

async function createGame(game){
    return await chai.request(game_service)
    .post("/game/lobbies/create_game")
    .send({game_id:game.game_id,host_id:game.host_id,opponent:game.opponent_id})
}
async function move_piece(game_move){
    return await chai.request(game_service)
    .put("/game/movePiece")
    .send({game_id:game_move.game_id,from:game_move.from,to:game_move.to})
}
async function change_turn(game_id){
    return await chai.request(game_service)
    .put("/game/turnChange")
    .send({game_id:game_id})
}
async function leave_game(game_quit){
    return await chai.request(game_service)
    .delete("/game/leaveGame")
    .send({game_id:game_quit.game_id,player_id:game_quit.player_id})
}
async function player_game_history(mail){
    return await chai.request(game_service)
    .get("/games/userHistory")
    .query({mail:mail})
}
describe('Game', async () => {
    before(async()=> {
        await Game.deleteMany({winner:opponent})
      });
    describe('POST Game',async () => {
        it('should create a new game',async() =>{
            const new_game = {
                game_id: 1,
                host_id:host,
                opponent_id: opponent
            }
            const game = await createGame(new_game)
            game.should.have.status(200)
        })
        
    })
    describe('PUT Game',async () => {
        it('should move a piece from player2 into a game',async() =>{
            const game_move = {
                game_id : game_id,
                from: 31,
                to:26

            }
            const new_piece = await move_piece(game_move)
            new_piece.should.have.status(200)
        })
        //Player1 just moved a piece, trying to move a piece from the same player as before
        it('should fail to move another piece from player1 into a game',async() =>{
            const wrong_game_move = {
                game_id : game_id,
                from: 33,
                to:29

            }
            const new_piece = await move_piece(wrong_game_move)
            new_piece.should.have.status(400)
        })
        //Moving a piece from player2
        it('should move a piece from player2',async()=>{
            const game_move = {
                game_id : game_id,
                from: 20,
                to: 25

            }
            const new_piece = await move_piece(game_move)
            new_piece.should.have.status(200)
        })
        //Should be player1 turn now, chaning turn to make player2's turn again
        it('should change turn',async()=>{
            const turn_changed = await change_turn(game_id)
            turn_changed.should.have.status(200)
        })
        //By changing turns, it's again player2' turn
        it('should move piece from player2',async()=>{
            const game_move = {
                game_id : game_id,
                from: 19,
                to: 24
            }
            const new_piece = await move_piece(game_move)
            new_piece.should.have.status(200)
        })
    })
    describe('DELETE Game',async () => {
        it('should fail to terminate a game',async ()=>{
            const game_quit = {
                game_id: game_id,
                player_id:"fake_user@gmail.com"
            }
            const player_left = await leave_game(game_quit)
            player_left.should.have.status(400)
        })
        it('should fail to terminate a game',async ()=>{
            const game_quit = {
                game_id: 2,
                player_id:host
            }
            const player_left = await leave_game(game_quit)
            player_left.should.have.status(400)
        })
        it('should make host@gmail.com leave current game',async()=>{
            const game_quit = {
                game_id: game_id,
                player_id:host
            }
            const player_left = await leave_game(game_quit)
            player_left.should.have.status(200)
        })
    })
    describe('GET Game',async () => {
        it('should find on DB last game played',async()=>{
            const games_by_host = await player_game_history(host)
            games_by_host.should.have.status(200)
        })
    })
})