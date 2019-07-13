const express = require('express');  
const router = express.Router();  

let gameIds = [];
const gameStatePerRoom = {};

const niyaRouter = (io) => {
	router.get('/', function(req, res) { 
		io.on('connection', function(socket){
			socket.on('createGame', function(data) {
				if (gameIds.includes(data.gameId)) {
					return;
				}
				gameIds.push(data.gameId);
				socket.join(data.gameId);
				socket.room = data.gameId;
				socket.color = 'blue';
				socket.emit('newGame', {name: data.name, room: data.gameId, tiles: data.tiles, isRestart: true});
				gameStatePerRoom[data.gameId] = {
					unclickedTiles: [].concat(data.tiles),
					playerTiles: {
						blue: [],
						red: []
					},
					gameTiles: [].concat(data.tiles),
					players: {
						blue: data.name
					},
					rows: [[], [], [], []],
  					cols: [[], [], [], []],
  					lastClicked: [],
  					curPlayer: 'blue'
				};
			
				if (data.isRestart) {
					io.sockets.in(data.gameId).emit('restart-created');
				}
			});

			socket.on('joinGame', function(data) {
				const room = io.nsps['/'].adapter.rooms[data.room];
				const gameState = gameStatePerRoom[data.room];
				const colorsInGame = gameState ? Object.keys(gameState.players) : [];
				if (room && colorsInGame.length === 1) {
					if (colorsInGame.includes('blue')) {
						gameState.players.red = data.name;
						socket.room = data.room;
						socket.color = 'red';
						socket.join(data.room);
						socket.broadcast.to(data.room).emit('player1', {players: gameState.players});
						if (gameState.unclickedTiles.length === 16) {
							socket.emit('player2', {name: data.name, room: data.room, tiles: gameState.gameTiles, players: gameState.players});
						} else {
							io.sockets.in(data.room).emit('player2Rejoin', {roomId: data.room, players: gameState.players, gameState: gameState});
						}
					} else if (colorsInGame.includes('red')) {
						gameState.players.blue = data.name;
						socket.room = data.room;
						socket.color = 'blue';
						socket.join(data.room);
						io.sockets.in(data.room).emit('player1Rejoin', {roomId: data.room, players: gameState.players, gameState: gameState});
					}
				}
			});

			socket.on('restartGame', function(data) {
				io.sockets.in(data.room).emit('restarted');
			});

			socket.on('playTurn', function(data) {
				const {room, tile, curPlayer} = data;
				const gameState = gameStatePerRoom[data.room];
				gameState.playerTiles[curPlayer].push(tile.index);
				
				[].concat(gameState.unclickedTiles).forEach((tileUC, ind) => {
				    if (tile.symbols[0] === tileUC.symbols[0] && tile.symbols[1] === tileUC.symbols[1]) {
				      gameState.unclickedTiles.splice(ind, 1);
				    }
				});

				gameState.rows[tile.row][tile.col] = curPlayer;
  				gameState.cols[tile.col][tile.row] = curPlayer;
  				gameState.lastClicked = [tile.symbols[0], tile.symbols[1]];
  				gameState.curPlayer = curPlayer === 'blue' ? 'red' : 'blue';

				socket.broadcast.to(room).emit('turnPlayed', {
					tile: tile,
					room: room,
					playedBy: curPlayer
				});
			});

			socket.on('gameEnded', function(data){
				socket.broadcast.to(data.room).emit('gameEnd', data);
				const removeGameId = gameIds.indexOf(data.room);
				if (removeGameId > -1) {
					gameIds.splice(removeGameId, 1);
					delete gameStatePerRoom[data.room]
				}
			});

			socket.on('disconnect', function() {
				if (gameStatePerRoom[socket.room] &&
					gameStatePerRoom[socket.room].players[socket.color]) {
					delete gameStatePerRoom[socket.room].players[socket.color];

					const playersInRoom = Object.keys(gameStatePerRoom[socket.room].players);

					if (playersInRoom.length === 0) {
						const removeGameId = gameIds.indexOf(socket.room);
						if (removeGameId > -1) {
							gameIds.splice(removeGameId, 1);
							delete gameStatePerRoom[socket.room]
						}
					}

					socket.leave(socket.room);
				}
			}); 

		});
		res.render('niya/index');
	});
	return router;
}; 

module.exports = niyaRouter;  