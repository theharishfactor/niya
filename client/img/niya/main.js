const Game = function(socket) {
  this.roomId = null;
  this.board = [];
  this.lastClicked = [];
  this.curPlayer = null;
  this.playerType = null;
  this.socket = socket;
  this.playerTiles = {
    blue: [],
    red: []
  };
  this.rows = [[], [], [], []];
  this.cols = [[], [], [], []];
  this.players = {};
  this.isGameOver = false;
  this.unclickedTiles = [];
}

Game.prototype.setPlayer= function(player) {
  this.players[player.playerType] = player;
}

Game.prototype.setCurPlayer = function(player){
  this.curPlayer = player;
  if (player === this.playerType) {
    document.getElementById('turn').innerHTML = 'Your turn';
  } else {
    document.getElementById('turn').innerHTML = 'Your opponent\'s turn';
  }
}

Game.prototype.getCurPlayer = function(){
  return this.curPlayer;
}

Game.prototype.setPlayerType = function(type) {
  this.playerType = type;
}

Game.prototype.getPlayerType = function(type) {
  return this.playerType;
}

Game.prototype.isAllowed = function(tile) {
  return this.lastClicked.length === 0 || this.lastClicked.includes(tile.symbols[0]) || this.lastClicked.includes(tile.symbols[1]);
}

Game.prototype.togglePlayer = function(lastMoveBy) {
  if (lastMoveBy === 'blue') {
    this.setCurPlayer('red');
  } else {
    this.setCurPlayer('blue');
  }
}

Game.prototype.generateTiles = function() {
  const symbolSet1 = ['Poem', 'Bird', 'Sun', 'Rain'];
  const symbolSet2 = ['Maple', 'Cherry', 'Pine', 'Lily'];
  const allSymbols = symbolSet1.concat(symbolSet2);

  const tiles = [];
  symbolSet1.forEach(symbol => {
    symbolSet2.forEach(sym => {
      tiles.push({
        [`has${symbol}`]: true,
        [`has${sym}`]: true,
        symbols: [symbol, sym]
      });
    })
  });
  shuffle(tiles);

  return tiles;
}

const clickHandler = function(tile) {
  if (this.getPlayerType()  !== this.getCurPlayer()) {
    return;
  }
  if (this.isGameOver) {
    return;
  }
  const isAllowedClick = this.isAllowed(tile);
  if (!isAllowedClick) {
    alert('Not a valid move');
  } else {
    this.playTurn(tile, this.getCurPlayer());
    this.updateBoard(tile, this.getCurPlayer());    
  }
}

Game.prototype.createGameBoard = function (tiles) {
  const container = document.getElementById('container');
  const tileElements = tiles.map((tile, index) => {
    const tileEl = document.createElement('div');
    tileEl.className = index %4 === 0 ? 'tile clearTile' : 'tile';
    tileEl.style.background = `url('../img/niya-${tile.symbols[1].toLowerCase()}.png'), url('../img/niya-${tile.symbols[0].toLowerCase()}.png')`;
    tile.row = Math.floor(index / 4);
    tile.col = Math.floor(index % 4);
    tileEl.id = `row-${tile.row}-col-${tile.col}`;
    tile.index = index;
    //tileEl.innerHTML = `<div style="text-align: center;">${tile.symbols[0]}</div><div style="text-align: center;">${tile.symbols[1]}</div>`;
    
    tileEl.addEventListener('click', clickHandler.bind(this, tile));
    this.unclickedTiles.push(tile);

    return tileEl;
  });

  for (i = 0; i<tileElements.length; i++) {
      container.appendChild(tileElements[i]);
      if (i%3 === 0) {
        const newDiv = document.createElement('div');
        container.appendChild(newDiv);
      }
  }
}

Game.prototype.displayBoard = function(roomId, message, tiles){
  document.getElementById('userMessage').innerHTML = message;
  this.createGameBoard(tiles);
  this.roomId = roomId;
}

Game.prototype.checkIfWin = function (curPlayer, tile) {
  const {row, col, index} = tile;
  if (curPlayer === 'blue') {
    checkPlayer = 'red';
  } else {
    checkPlayer = 'blue';
  }
  if (this.rows[row].length  === 4 && !this.rows[row].includes(checkPlayer) || 
    this.cols[col].length === 4 && !this.cols[col].includes(checkPlayer)) {
    alert(`${curPlayer} wins`);
    this.isGameOver = true;
    return true;
  }

  let gridCheck = [
    [index, index+1, index+4, index+5],
    [index, index-1, index-4, index-5],
    [index, index-1, index+3, index+4],
    [index, index+1, index-3, index-4]
  ];

  for (let i=0; i<gridCheck.length; i++) {
    const tilesToCheck = gridCheck[i];
    let win = true;
    for (let j=0; j<tilesToCheck.length; j++) {
      const tileIndex = tilesToCheck[j];
      if (!this.playerTiles[curPlayer].includes(tileIndex)) {
        win = false;
        break;
      }
    }

    if (win) {
      return true;
    }
  }

  win = true;
  console.log(this.unclickedTiles, this.lastClicked);
  this.unclickedTiles.forEach(tile => {
    if (tile.symbols.includes(this.lastClicked[0]) || tile.symbols.includes(this.lastClicked[1])) {
      win = false;
    }
  });

  return win;
}


Game.prototype.updateBoard = function(tile, playedBy) {
  if (playedBy === this.getCurPlayer()) {
    this.lastClicked = [tile.symbols[0], tile.symbols[1]];  
    const id = `row-${tile.row}-col-${tile.col}`; 

    const tileEl = document.getElementById(id);
    tileEl.className = `${tileEl.className} ${playedBy}Covered`;
    document.getElementById('lastClicked').style.background = `${tileEl.style.background}`;
    document.getElementById('lastClickedPanel').style.display = 'block';

    tileEl.style.pointerEvents = 'none';
    tile.clicked = playedBy;
    
    this.playerTiles[playedBy].push(tile.index);
    this.rows[tile.row].push(playedBy);
    this.cols[tile.col].push(playedBy);

    [].concat(this.unclickedTiles).forEach((tileUC, ind) => {
      if (tile.symbols[0] === tileUC.symbols[0] && tile.symbols[1] === tileUC.symbols[1]) {
        const removed = this.unclickedTiles.splice(ind, 1);
      }
    });
    
    if (this.checkIfWin(playedBy, tile)) {
      alert(`${playedBy} Wins!`);
      this.isGameOver = true;
    } else if (this.unclickedTiles.length === 0) {
      alert('Draw!');
      this.isGameOver = true;
    } 
    this.togglePlayer(playedBy);
  }
}

Game.prototype.getRoomId = function(){
  return this.roomId;
}

Game.prototype.playTurn = function(tile, curPlayer){
  var turnObj = {
    tile,
    curPlayer,
    room: this.getRoomId()
  };
  // Emit an event to update other player that you've played your turn.
  this.socket.emit('playTurn', turnObj);
}

Game.prototype.endGame = function() {
  console.log("Game Ends");
}
