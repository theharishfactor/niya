const setUpGame = function() {

  // Types of players
  let player = null;
  let game = null;
  const socket = io('http://localhost:3000');
  let created = false;
  let joined = false;

  const newButton = document.getElementById('new');
  const newGameId = document.getElementById('gameIdNew');
  const joinButton = document.getElementById('join');
  const restartButton = document.getElementById('restartButton');
  const newGameName = document.getElementById('nameNew');
  const joinGameName = document.getElementById('nameJoin');
  const room = document.getElementById('room');

  newButton.addEventListener('click', (e) => {
    if (!created) {
      created = true;
      const name = newGameName.value;
      const gameId = newGameId.value;
      if(!name || name.trim().length === 0){
        alert('Please enter your name.');
        return;
      }
      if(!gameId || gameId.trim().length === 0){
        alert('Please enter a game Id.');
        return;
      }
      game = new Game(socket);
      socket.emit('createGame', {name: name.trim(), gameId: gameId.trim(), tiles: game.generateTiles()});
    }
  });

  joinButton.addEventListener('click', (e) => {
    if (!joined) {
      joined = true;
      const name = joinGameName.value;
      const gameId = room.value;
      if(!name || name.trim().length === 0){
        alert('Please enter your name.');
        return;
      }
      if(!gameId || gameId.trim().length === 0){
        alert('Please enter a game Id.');
        return;
      }
      socket.emit('joinGame', {name: name.trim(), room: gameId.trim()});
    }
  });

  restartButton.addEventListener('click', (e) => {
    socket.emit('restartGame', {room: game.roomId});
  });

  socket.on('restarted', function(data) {
    if (!created && game.getPlayerType() === 'red') {
      document.getElementById('restartButton').style.display = 'none';

      const name = game.players['red'].name;
      const gameId = game.roomId;
      game.reset();
      created = true;
      socket.emit('createGame', {name: name.trim(), gameId: gameId.trim(), tiles: game.generateTiles(), isRestart: true});
    }
  });

  socket.on('restart-created', function(data) {
    if (!created && !joined && game.getPlayerType() === 'blue') {
      document.getElementById('restartButton').style.display = 'none';

      const name = game.players['blue'].name;
      const gameId = game.roomId;

      game.reset();
      joined = true;
      created = true;
      socket.emit('joinGame', {name: name.trim(), room: gameId.trim()});
    }
  });

  socket.on('newGame', function(data){
    var message = `Waiting for Player-2 to connect`;


    document.getElementById('createPanel').style.display = 'none';
    document.getElementById('joinPanel').style.display = 'none';
    document.getElementById('gameStatus').style.display = 'block';

    document.getElementById('gameStatus').innerHTML = 'Waiting for Player-2';
    document.getElementById('gameId').innerHTML = data.room;
    document.getElementById('gameId').style.display = 'block';
    document.getElementById('playerName').style.display = 'block';

    document.getElementById('playerName').innerHTML = data.name;
    document.getElementById('playerName').className = 'blueColor';

    game.setPlayerType('blue');
    game.setPlayer({
      playerType: 'blue',
      name: data.name
    });
    game.displayBoard(data.room, message, data.tiles);   
  });

 
  socket.on('player1', function(data){    
    game.setCurPlayer('blue');
    document.getElementById('gameStatus').innerHTML = 'In progress';
    document.getElementById('gameId').style.display = 'none';
    document.getElementById('turn').innerHTML = 'Blue';
    document.getElementById('turn').style.display = 'block';
    document.getElementById('opponent').style.display = 'block';

    document.getElementById('opponent').innerHTML = data.players[1];
    document.getElementById('opponent').className = 'redColor';

    game.setPlayer({
      playerType: 'red',
      name: data.players[1]
    });
  });

 
  socket.on('player2', function(data){
    var message = `Hello ${data.name}`;

    //Create game for player 2
    game = new Game(socket);
    game.setPlayerType('red');
    game.setCurPlayer('blue');
    game.setPlayer({
      playerType: 'red',
      name: data.name
    });

    game.setPlayer({
      playerType: 'blue',
      name: data.players[0]
    });

    game.displayBoard(data.room, message, data.tiles);

    document.getElementById('createPanel').style.display = 'none';
    document.getElementById('joinPanel').style.display = 'none';
    document.getElementById('gameId').style.display = 'none';
    document.getElementById('playerName').style.display = 'block';
    document.getElementById('opponent').style.display = 'block';
    document.getElementById('turn').style.display = 'block';
    
    document.getElementById('playerName').innerHTML = data.name;
    document.getElementById('playerName').className = 'redColor';
    document.getElementById('opponent').innerHTML = data.players[0];
    document.getElementById('opponent').className = 'blueColor';
    document.getElementById('gameStatus').style.display = 'block';
    document.getElementById('gameStatus').innerHTML = 'In progress';

    document.getElementById('turn').innerHTML = 'Blue';

  }); 

  socket.on('turnPlayed', function(data){
    game.updateBoard(data.tile, data.playedBy);
  });

  socket.on('gameEnd', function(data){
    joined = false;
    created = false;

    document.getElementById('restartButton').style.display = 'inline-block';
    // game.endGame(data.message);
  });
  
  socket.on('err', function(data){
    game.endGame(data.message);
  });
};

setUpGame();