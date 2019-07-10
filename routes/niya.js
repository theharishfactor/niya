const express = require('express');  
const router = express.Router();  

let gameIds = [];
const tilesPerRoom = {};
const playersPerRoom = {};

const niyaRouter = (io) => {
	router.get('/', function(req, res) { 
		io.on('connection', function(socket){
			socket.on('createGame', function(data) {
				if (gameIds.includes(data.gameId)) {
					return;
				}
				gameIds.push(data.gameId);
				socket.join(data.gameId);
				socket.emit('newGame', {name: data.name, room: data.gameId, tiles: data.tiles, isRestart: true});
				tilesPerRoom[data.gameId] = data.tiles;
				playersPerRoom[data.gameId] = [data.name];

				if (data.isRestart) {
					io.sockets.in(data.gameId).emit('restart-created');
				}
			});

			socket.on('joinGame', function(data) {
				const room = io.nsps['/'].adapter.rooms[data.room];

				if (room && playersPerRoom[data.room].length === 1) {
					playersPerRoom[data.room].push(data.name);
					socket.join(data.room);
					socket.broadcast.to(data.room).emit('player1', {players: playersPerRoom[`${data.room}`]});
					socket.emit('player2', {name: data.name, room: data.room, tiles: tilesPerRoom[`${data.room}`], players: playersPerRoom[`${data.room}`]})
				}
			});

			socket.on('restartGame', function(data) {
				io.sockets.in(data.room).emit('restarted');
			});

			socket.on('playTurn', function(data) {
				socket.broadcast.to(data.room).emit('turnPlayed', {
					tile: data.tile,
					room: data.room,
					playedBy: data.curPlayer
				});
			});

			socket.on('gameEnded', function(data){
				socket.broadcast.to(data.room).emit('gameEnd', data);
				const removeGameId = gameIds.indexOf(data.room);
				if (removeGameId > -1) {
					gameIds.splice(removeGameId, 1);
					delete tilesPerRoom[data.room];
					delete playersPerRoom[data.room];
				}
				// socket.leave(data.room);
			});

			socket.on('disconnect', function(data){
				socket.leave(data.room);
			}); 

		});
		res.render('niya/index');
	});
	return router;
}; 

module.exports = niyaRouter;  