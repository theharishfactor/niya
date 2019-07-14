const setUpGame = function() {

  // Types of players
  let player = null;
  let game = null;
  const socket = io('http://localhost:3000');
  let created = false;
  let joined = false;

  const newButton = document.getElementById('new');
  const joinButton = document.getElementById('join');
  const restartButton = document.getElementById('restartButton');
  const newGameName = document.getElementById('nameNew');
  const joinGameName = document.getElementById('nameJoin');
  const room = document.getElementById('room');

  newButton.addEventListener('click', (e) => {
    if (!created) {
      created = true;
      const name = newGameName.value;
      if(!name || name.trim().length === 0){
        alert('Please enter your name.');
        return;
      }

      game = new Game(socket);
      socket.emit('createGame', {name: name.trim(), tiles: game.generateTiles()});
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

    document.getElementById('opponent').innerHTML = data.players.red;
    document.getElementById('opponent').className = 'redColor';
    game.setPlayer({
      playerType: 'red',
      name: data.players.red
    });
  });

   socket.on('player1Rejoin', function(data){    
    document.getElementById('gameStatus').innerHTML = 'In progress';
    document.getElementById('gameId').style.display = 'none';
    document.getElementById('opponent').innerHTML = data.players.blue;
    document.getElementById('opponent').className = 'blueColor';
    document.getElementById('turn').innerHTML = data.gameState.curPlayer;
     
     if (game) {
      game.setCurPlayer(data.gameState.curPlayer);
      game.setPlayer({
        playerType: 'blue',
        name: data.players.blue
      });
    }
    
    if (!game) {
      //This is for blue player's screen rendering
      document.getElementById('createPanel').style.display = 'none';
      document.getElementById('joinPanel').style.display = 'none';
      document.getElementById('gameStatus').style.display = 'block';

      document.getElementById('gameStatus').innerHTML = 'In progress';
      document.getElementById('playerName').style.display = 'block';
      document.getElementById('playerName').innerHTML = data.players.blue;
      document.getElementById('playerName').className = 'blueColor';
      document.getElementById('opponent').style.display = 'block';
      document.getElementById('opponent').innerHTML = data.players.red;
      document.getElementById('opponent').className = 'redColor';
      document.getElementById('turn').innerHTML = data.gameState.curPlayer;
      document.getElementById('turn').style.display = 'block';
    

      game = new Game(socket);
      game.setPlayer({
        playerType: 'blue',
        name: data.players.blue
      });
      game.setPlayerType('blue');
      game.setPlayer({
        playerType: 'red',
        name: data.players.red
      });
      game.roomId = data.roomId;
      game.constructGameFromState(data.gameState); 
    }
  });

 
  socket.on('player2', function(data){
    var message = `Hello ${data.name}`;

    game = new Game(socket);
    game.setPlayerType('red');
    game.setCurPlayer('blue');
    game.setPlayer({
      playerType: 'red',
      name: data.name
    });

    game.setPlayer({
      playerType: 'blue',
      name: data.players.blue
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
    document.getElementById('opponent').innerHTML = data.players.blue;
    document.getElementById('opponent').className = 'blueColor';
    document.getElementById('gameStatus').style.display = 'block';
    document.getElementById('gameStatus').innerHTML = 'In progress';

    document.getElementById('turn').innerHTML = 'Blue';

  }); 


  socket.on('player2Rejoin', function(data){    
    document.getElementById('gameStatus').innerHTML = 'In progress';
    document.getElementById('gameId').style.display = 'none';
    document.getElementById('opponent').innerHTML = data.players.red;
    document.getElementById('opponent').className = 'redColor';
    document.getElementById('turn').innerHTML = data.gameState.curPlayer;
    if (game) {
      game.setCurPlayer(data.gameState.curPlayer);
      game.setPlayer({
        playerType: 'red',
        name: data.players.red
      });
    }
    
    if (!game) {
      document.getElementById('createPanel').style.display = 'none';
      document.getElementById('joinPanel').style.display = 'none';
      document.getElementById('gameStatus').style.display = 'block';

      document.getElementById('gameStatus').innerHTML = 'In progress';
      document.getElementById('playerName').style.display = 'block';
      document.getElementById('playerName').innerHTML = data.players.red;
      document.getElementById('playerName').className = 'redColor';
      document.getElementById('opponent').innerHTML = data.players.blue;
      document.getElementById('opponent').className = 'blueColor';
      document.getElementById('opponent').style.display = 'block';
      document.getElementById('turn').innerHTML = data.gameState.curPlayer;
      document.getElementById('turn').style.display = 'block';
    

      game = new Game(socket);

      game.setPlayerType('red');
      game.setPlayer({
        playerType: 'red',
        name: data.players.red
      });

      game.setPlayer({
        playerType: 'blue',
        name: data.players.blue
      });

      game.roomId = data.roomId;
      game.constructGameFromState(data.gameState); 
    }
  });

  socket.on('turnPlayed', function(data) {
    game.updateBoard(data.tile, data.playedBy);
  });

  socket.on('gameEnd', function(data){
    joined = false;
    created = false;

    document.getElementById('restartButton').style.display = 'inline-block';
    // game.endGame(data.message);
  });

  socket.on('opponentDisconnected', function() {
    document.getElementById('gameStatus').innerHTML = 'Opponent Disconnected';
  });
  
  socket.on('err', function(data){
    game.endGame(data.message);
  });
};

setUpGame();