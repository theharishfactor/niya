const setUpGame = function() {

  // Types of players
  let P1 = 'blue', P2 = 'red';
  let player = null;
  let game = null;
  const socket = io('http://45.55.14.12:3000:3000');
  let created = false;
  let joined = false;

  const newButton = document.getElementById('new');
  const newGameId = document.getElementById('gameIdNew');
  const joinButton = document.getElementById('join');
  const newGameName = document.getElementById('nameNew');
  const joinGameName = document.getElementById('nameJoin');
  const room = document.getElementById('room');

  newButton.addEventListener('click', (e) => {
    if (!created) {
      created = true;
      const name = newGameName.value;
      const gameId = newGameId.value;
    	if(!name){
        alert('Please enter your name.');
        return;
      }
      if(!name){
        alert('Please enter your name.');
        return;
      }
      game = new Game(socket);
      socket.emit('createGame', {name: name, gameId: gameId, tiles: game.generateTiles()});
      
    }
  });

  joinButton.addEventListener('click', (e) => {
    if (!joined) {
      joined = true;
    	const name = joinGameName.value;
    	const gameId = room.value;
    	if(!name || !gameId){
        alert('Please enter your name.');
        return;
      }
      socket.emit('joinGame', {name: name, room: gameId});
    }
  });

  socket.on('newGame', function(data){
    var message = `Invite with Game ID: ${data.room}.\n
    Waiting for player 2...`;

    document.getElementById('createPanel').style.display = 'none';
    document.getElementById('joinPanel').style.display = 'none';

    game.setPlayerType('blue');
    game.setCurPlayer('blue');
    game.setPlayer({
      playerType: 'blue',
      name: data.name
    });
    game.displayBoard(data.room, message, data.tiles);   
  });

  /**
   * If player creates the game, he'll be P1(X) and has the first turn.
   * This event is received when opponent connects to the room.
   */
  socket.on('player1', function(data){    
    game.setCurPlayer('blue');
    document.getElementById('userMessage').innerHTML = 'Game in progress...';
    document.getElementById('turn').innerHTML = 'Your turn';
    document.getElementById('createPanel').style.display = 'none';
    document.getElementById('joinPanel').style.display = 'none';
    
  });

  /**
   * Joined the game, so player is P2(O). 
   * This event is received when P2 successfully joins the game room. 
   */
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
    game.displayBoard(data.room, message, data.tiles);
    document.getElementById('userMessage').innerHTML = 'Game in progress...';
    document.getElementById('turn').innerHTML = 'Your opponent\'s turn';

    document.getElementById('createPanel').style.display = 'none';
    document.getElementById('joinPanel').style.display = 'none';
    
  }); 

  /**
   * Opponent played his turn. Update UI.
   * Allow the current player to play now. 
   */
  socket.on('turnPlayed', function(data){
    game.updateBoard(data.tile, data.playedBy);
  });

  /**
   * If the other player wins or game is tied, this event is received. 
   * Notify the user about either scenario and end the game. 
   */
  socket.on('gameEnd', function(data){
    console.log(data);
    game.endGame(data.message);
    socket.leave(data.room);
  })

  /**
   * End the game on any err event. 
   */
  socket.on('err', function(data){
    console.log(data);
    game.endGame(data.message);
  });
};

setUpGame();