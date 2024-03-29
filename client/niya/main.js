const Game = function(socket) {
  this.reset()
  this.socket = socket;
  this.roomId = null;
};

Game.prototype.constructGameFromState = function(gameState) {
  this.playerTiles = gameState.playerTiles;
  this.rows = gameState.rows;
  this.cols = gameState.cols;
  this.lastClicked = gameState.lastClicked;
  this.gameTiles = gameState.gameTiles;
  this.curPlayer = gameState.curPlayer;

  const tiles = document.getElementsByClassName('playingTile');
  while(tiles.length > 0){
    tiles[0].parentNode.removeChild(tiles[0]);
  }
  this.createGameBoard(this.gameTiles, true);

  document.getElementById('lastClicked').style.backgroundImage = 
    `url('../img/niya-${this.lastClicked[1].toLowerCase()}.png'), url('../img/niya-${this.lastClicked[0].toLowerCase()}.png')`;
  document.getElementById('lastClickedPanel').style.display = 'block';

  this.unclickedTiles = gameState.unclickedTiles;
}

Game.prototype.reset = function() {
  this.playerType = null;
  this.isGameOver = false;
  
  this.players = {};
  this.curPlayer = null;
  this.lastClicked = [];
  this.playerTiles = {
    blue: [],
    red: []
  };
  this.rows = [[], [], [], []];
  this.cols = [[], [], [], []];
  this.unclickedTiles = [];

  const tiles = document.getElementsByClassName('playingTile');
  while(tiles.length > 0){
    tiles[0].parentNode.removeChild(tiles[0]);
  }

  document.getElementById('lastClickedPanel').style.display = 'none';
}

Game.prototype.setPlayer= function(player) {
  this.players[player.playerType] = player;
}

Game.prototype.setCurPlayer = function(player){
  this.curPlayer = player;
  const bluePlayer = this.players['blue'] ? this.players['blue'].name : 'Blue';
  const redPlayer = this.players['red'] ? this.players['red'].name  : 'Red';

  document.getElementById('turn').innerHTML =  player === 'blue' ? bluePlayer : redPlayer;
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

Game.prototype.createGameBoard = function (tiles, fromState) {
  const container = document.getElementById('tileContainer');
  const tileElements = tiles.map((tile, index) => {
    tile.row = Math.floor(index / 4);
    tile.col = Math.floor(index % 4);
    tile.index = index;
    
    const tileEl = document.createElement('div');
    tileEl.id = `row-${tile.row}-col-${tile.col}-index-${tile.index}`;
    tileEl.className = index %4 === 0 ? 'tile playingTile clearTile' : 'tile playingTile';
    tileEl.style.backgroundImage = `url('../img/niya-${tile.symbols[1].toLowerCase()}.png'), url('../img/niya-${tile.symbols[0].toLowerCase()}.png')`;
    tileEl.addEventListener('click', clickHandler.bind(this, tile));
    this.unclickedTiles.push(tile);

    if (fromState) {
      if (this.playerTiles.blue.includes(tile.index)) {
        tileEl.className = `${tileEl.className} blueCovered`;
        tileEl.style.pointerEvents = 'none';
      } else if (this.playerTiles.red.includes(tile.index)) {
        tileEl.className = `${tileEl.className} redCovered`;
        tileEl.style.pointerEvents = 'none';
      }
      if (tile.symbols.includes(this.lastClicked[0]) && tile.symbols.includes(this.lastClicked[1])) {
        tileEl.className = `${tileEl.className} lastPlayed`;
      }
    }

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
  this.createGameBoard(tiles);
  this.roomId = roomId;
}

Game.prototype.isRowOrColumnFilled = function(curPlayer, row, col) {
  let checkPlayer = null;
  if (curPlayer === 'blue') {
    checkPlayer = 'red';
  } else {
    checkPlayer = 'blue';
  }

  return this.rows[row].filter(i => i === curPlayer).length === 4 ||
    this.cols[col].filter(i => i === curPlayer).length === 4;
}

Game.prototype.isDiagonalComplete = function (curPlayer, index) {
  if (index%5 === 0 || index%3 === 0) {
    const playerTiles = this.playerTiles[curPlayer];
    if (index %5 === 0) {
      return playerTiles.includes(0) && playerTiles.includes(5) &&
        playerTiles.includes(10) && playerTiles.includes(15);
    } else if (index %3 === 0) {
      return playerTiles.includes(3) && playerTiles.includes(6) &&
        playerTiles.includes(9) && playerTiles.includes(12);
    }
  }
  return false;
};


Game.prototype.isGridComplete = function(curPlayer, row, col) {
  if (row > 0) {
    if (col < 3) {
      if (this.rows[row][col] === curPlayer && this.rows[row-1][col] === curPlayer && 
        this.rows[row-1][col+1] === curPlayer && this.rows[row][col+1] === curPlayer) {
        return true;
      }
    } 
    if (col > 0) {
      if(this.rows[row][col] === curPlayer && this.rows[row-1][col] === curPlayer && 
        this.rows[row-1][col-1] === curPlayer && this.rows[row][col-1] === curPlayer) {
        return true;
      }
    }
  }

  if (row < 3) {
    if (col < 3) {
      if (this.rows[row][col] === curPlayer && this.rows[row+1][col] === curPlayer && 
        this.rows[row+1][col+1] === curPlayer && this.rows[row][col+1] === curPlayer) {
        return true;
      }
    }
    if (col > 0) {
      if (this.rows[row][col] === curPlayer && this.rows[row+1][col] === curPlayer && 
        this.rows[row+1][col-1] === curPlayer && this.rows[row][col-1] === curPlayer) {
        return true;
      }
    }
  }

  return false;
};

Game.prototype.blockedOpponentClicks = function(tile) {
  let blocked = true;
  this.unclickedTiles.forEach(tile => {
    if (tile.symbols.includes(this.lastClicked[0]) || tile.symbols.includes(this.lastClicked[1])) {
      blocked = false;
    }
  });

  return blocked;
};

Game.prototype.checkIfWin = function (curPlayer, tile) {
  const {row, col, index} = tile;
  
  if (this.isRowOrColumnFilled(curPlayer, row, col)) {
    this.isGameOver = true;
    return true;
  }

  if (this.isGridComplete(curPlayer, row, col)) {
    this.isGameOver = true;
    return true;
  }
  
 if (this.isDiagonalComplete(curPlayer, index)) {
    this.isGameOver = true;
    return true;
  }

  return false;
};

Game.prototype.removeFromUnclicked = function(tile) {
  [].concat(this.unclickedTiles).forEach((tileUC, ind) => {
    if (tile.symbols[0] === tileUC.symbols[0] && tile.symbols[1] === tileUC.symbols[1]) {
      this.unclickedTiles.splice(ind, 1);
    }
  });
};

Game.prototype.checkIfDraw = function() {
  return this.unclickedTiles.length === 0;
};

Game.prototype.addClickedTileToList = function(tile, playedBy) {
  this.playerTiles[playedBy].push(tile.index);
  this.rows[tile.row][tile.col] = playedBy;
  this.cols[tile.col][tile.row] = playedBy;
};

Game.prototype.updateBoard = function(tile, playedBy) {
  if (playedBy === this.getCurPlayer()) {
    this.lastClicked = tile.symbols;  
    const id = `row-${tile.row}-col-${tile.col}-index-${tile.index}`; 

    removeLastPlayedClass();
    modifyClickedTile(id, playedBy);
    
    tile.clicked = playedBy;
    this.addClickedTileToList(tile, playedBy);
    if (this.checkIfWin(playedBy, tile)) {
      alert(`${this.players[playedBy].name} wins!`);
      this.isGameOver = true;
      this.socket.emit('gameEnded', {room: this.roomId});
      document.getElementById('gameStatus').innerHTML = `${this.players[playedBy].name} wins!`;
      this.togglePlayer(playedBy);
      return;
    } 

    this.removeFromUnclicked(tile);
    if (this.checkIfDraw()) {
      alert('Draw!');
      document.getElementById('gameStatus').innerHTML = `It's a draw!`;
      this.isGameOver = true;
      this.socket.emit('gameEnded', {room: this.roomId});
      this.togglePlayer(playedBy);
      return;
    } 

    if (this.blockedOpponentClicks(tile)) {
      alert(`${this.players[playedBy].name} wins!`);
      this.isGameOver = true;
      this.socket.emit('gameEnded', {room: this.roomId});
      document.getElementById('gameStatus').innerHTML = `${this.players[playedBy].name} wins!`;
      this.togglePlayer(playedBy);
      return;
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

  this.socket.emit('playTurn', turnObj);
}

Game.prototype.endGame = function() {
  
}
