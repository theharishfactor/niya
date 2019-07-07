# niya

This is an online implementation of the boardgame - Niya. This is a 2-player game.

## Gameplay:
There is a 4x4 grid of tiles. Each tile has two of the following 8 symbols on it: Bird, Rain Cloud, Pine leaf, Cherry branch, Rising Sun, Poetry flag, Lily, Maple leaves.

![View of the Niya gameboard](https://github.com/theharishfactor/niya/blob/master/client/img/niya%20tiles.png)

On every turn, the player can cover one of the uncovered tiles on the board. The player can start with any tile on the first turn of the game. For every subsequent turn, players can only cover tiles that contain at least one symbol common with the previously covered tile.

Example:
If Player 1 covers a tile with "Bird and Rain cloud", then the next player can cover "Bird and Pine" or "Rain cloud and Cherry branch". They cannot cover a tile with "Pine and Cherry Branch" since neither of those symbols are present on the last covered tile.


## Winning Conditions:
1. Get 4 consecutive tiles covered in a row with same color 
![row win](https://github.com/theharishfactor/niya/blob/master/client/img/row-win.png)

2. Get 4 consecutive tiles covered in a column with same color 
![column win]](https://github.com/theharishfactor/niya/blob/master/client/img/col-win.png)

3. Get 2x2 grid of tiles covered with the same color
![grid win](https://github.com/theharishfactor/niya/blob/master/client/img/grin-win.png)

4. Prevent the opponent from clicking a tile on their turn.

## Building

The app requires a nodejs to build. Once you clone the repository, run from the directory:

```
npm install
```

To start the game:
```
npm run start
```

## How to connect
1. Both players connect to http://localhost:3000/niya 
2. One of the the players creates a game with a custom string
3. Player 2 joins with the game id chosen by Player 1
4. Have fun!

