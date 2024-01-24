const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const message = document.getElementById("message");
const messageText = document.getElementById("messageText");
const button = document.getElementById("button");

message.style.visibility = "hidden";

// canvas.width = 500;
// canvas.height = 500;
let winsize = Math.min(window.innerWidth, window.innerHeight);
canvas.width = winsize;
canvas.height = winsize;

const rows = 8; //horizontal
const cols = 8; //vertical
let bcol = Math.max(rows, cols);

let scale = winsize/bcol;//62.5;//canvas.width / rows;

window.onresize = function() {
  winsize = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = winsize;
  canvas.height = winsize;
  scale = winsize/bcol;
}

const IMAGES = {
  0: createImage("./assets/peshka_white.png"),
  6: createImage("./assets/peshka_black.png"),
  1: createImage("./assets/king_white.png"),
  7: createImage("./assets/king_black.png"),
  4: createImage("./assets/bashnya_white.png"),
  10: createImage("./assets/bashnya_black.png"),
  3: createImage("./assets/kon_white.png"),
  9: createImage("./assets/kon_black.png"),
  5: createImage("./assets/officer_white.png"),
  11: createImage("./assets/officer_black.png"),
  2: createImage("./assets/queen_white.png"),
  8: createImage("./assets/queen_black.png")
}

const TYPE = {
  PESHKA_WHITE: 0,
  KING_WHITE: 1,
  QUEEN_WHITE: 2,
  KON_WHITE: 3,
  BASHNYA_WHITE: 4,
  OFFICER_WHITE: 5,
  PESHKA_BLACK: 6,
  KING_BLACK: 7,
  QUEEN_BLACK: 8,
  KON_BLACK: 9,
  BASHNYA_BLACK: 10,
  OFFICER_BLACK: 11
}

class Tile {
  constructor(row, col, color) {
    this.col = col;
    this.row = row;
    this.color = color;
    this.c = color;
    this.id = Math.floor(Math.random() * 100000);
    this.piece = null;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.row * scale, this.col * scale, scale, scale);
  }
}

class Piece {
  constructor(row, col, type) {
    this.row = row;
    this.col = col;
    this.position = {
      x: this.row * scale,
      y: this.col * scale
    }
    this.type = type;
    this.index = 0;
    this.smoothness = 0.1;
  }
  draw() {
    this.position.x += lerp(this.position.x, this.row * scale, this.smoothness);
    this.position.y += lerp(this.position.y, this.col * scale, this.smoothness);
    ctx.drawImage(IMAGES[this.type], this.position.x, this.position.y, scale, scale);
  }
}

let tiles = [];
let pieces = [];
let whiteTurn = true; //white's turn
let mouse = {
  position: {
    x: 0,
    y: 0
  },
  selected: { id: Math.random() },
  down: false
}

function init() {
  tiles = [];
  pieces = [];
  let i = 0;
  for(let col = 0; col < cols; col++) { //vertical
    i++;
    for(let row = 0; row < rows; row++) { //horizontal
      i++;
      tiles.push(new Tile(row, col, (i % 2 == 0) ? "white" : "black"));
    }
  }

  setupBoard();
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  tiles.forEach((tile) => {
    tile.draw(ctx);
  })

  pieces.forEach((piece, i) => {
    piece.draw();
    piece.index = i;

    if (piece.type == TYPE.PESHKA_WHITE && piece.col == 0) piece.type = TYPE.QUEEN_WHITE;
    if (piece.type == TYPE.PESHKA_BLACK && piece.col == cols - 1) piece.type = TYPE.QUEEN_BLACK;
  })

  if (findWhiteKing() == null) {
    displayMessage("Black Wins!", function() {init();});
  }
  if (findBlackKing() == null) {
    displayMessage("White Wins!", function() {init();});
  }

}

//networking
peer.on("open", (id) => {
  currentPeerId = id;
})

socket.on("gameFound", (othUser) => {
  otherUser = othUser;
  playAsWhite = otherUser.goFirst;
  message.style.visibility = "hidden";
  connection = peer.connect(otherUser.peerId);
  connection.on("open", () => {
    connectionValid = true;

    displayMessage("You are playing " + (playAsWhite ? "white" : "black") + ".", function() {});
  });
  run(); //once game is found start the local game
})
function lookForGame() {
  if (currentPeerId == null) alert("Error getting webrtc id");
  displayMessage("Looking for game", function() {});
  socket.emit("searchForGame", currentPeerId);
}

peer.on("connection", (conn) => {
  conn.on("data", (otherMove) => {
    move(pieces[otherMove.piece], otherMove.row, otherMove.col, false);
  })
})


function findWhiteKing() {
  for(let i = 0; i < pieces.length; i++) {
    if (pieces[i].type == TYPE.KING_WHITE) return pieces[i];
  }
  return null
}
function findBlackKing() {
  for(let i = 0; i < pieces.length; i++) {
    if (pieces[i].type == TYPE.KING_BLACK) return pieces[i];
  }
  return null
}

function run() {
  init();
  gameLoop();
}

window.onload = function() {
  displayMessage("Welcome to chess \n By minecraftub", function() {lookForGame();});
}

function setupBoard() {
  //pieces.push(new Piece(0, 0, TYPE.PESHKA_WHITE));

  //black setup
  for(let col = 0; col < 2; col++) {
    for(let row = 0; row < rows; row++) {
      const p = new Piece(row, col, TYPE.PESHKA_BLACK);

      if (col == 0 && row == 4) p.type = TYPE.KING_BLACK;
      if (col == 0 && row == 0 || col == 0 && row == rows - 1) p.type = TYPE.BASHNYA_BLACK;
      if (col == 0 && row == 1 || col == 0 && row == rows - 2) p.type = TYPE.KON_BLACK;
      if (col == 0 && row == 2 || col == 0 && row == rows - 3) p.type = TYPE.OFFICER_BLACK;
      if (col == 0 && row == 3) p.type = TYPE.QUEEN_BLACK;

      pieces.push(p);
    }
  }

  //white setup
  for(let col = cols - 2; col < cols; col++) {
    for(let row = 0; row < rows; row++) {
      const p = new Piece(row, col, TYPE.PESHKA_WHITE);

      if (col == cols - 1 && row == 4) p.type = TYPE.KING_WHITE;
      if (col == cols - 1 && row == 0 || col == cols - 1 && row == rows - 1) p.type = TYPE.BASHNYA_WHITE;
      if (col == cols - 1 && row == 1 || col == cols - 1 && row == rows - 2) p.type = TYPE.KON_WHITE;
      if (col == cols - 1 && row == 2 || col == cols - 1 && row == rows - 3) p.type = TYPE.OFFICER_WHITE;
      if (col == cols - 1 && row == 3) p.type = TYPE.QUEEN_WHITE;

      pieces.push(p);
    }
  }

}

function createImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

window.onmousedown = function() {
  mouse.down = true;

  tiles.forEach((tile) => {
    hasPiece(tile);
      if (
        tile.piece != null && tile.piece.type == TYPE.PESHKA_WHITE && whiteTurn && playAsWhite || 
        tile.piece != null && tile.piece.type == TYPE.PESHKA_BLACK && !whiteTurn && !playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.KING_WHITE && whiteTurn && playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.KING_BLACK && !whiteTurn && !playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.BASHNYA_WHITE && whiteTurn && playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.BASHNYA_BLACK && !whiteTurn && !playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.KON_WHITE && whiteTurn && playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.KON_BLACK && !whiteTurn && !playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.OFFICER_WHITE && whiteTurn && playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.OFFICER_BLACK && !whiteTurn && !playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.QUEEN_WHITE && whiteTurn && playAsWhite ||
        tile.piece != null && tile.piece.type == TYPE.QUEEN_BLACK && !whiteTurn && !playAsWhite
      ) { //has a piece on the tile
        if (
          mouse.position.x > tile.row * scale &&
          mouse.position.x < tile.row * scale + scale &&
          mouse.position.y > tile.col * scale &&
          mouse.position.y < tile.col * scale + scale
        ) {
          mouse.selected = tile;
        }
      } else if (mouse.selected != null) {
      if (
        mouse.selected.piece != null &&
        mouse.position.x > tile.row * scale &&
        mouse.position.x < tile.row * scale + scale &&
        mouse.position.y > tile.col * scale &&
        mouse.position.y < tile.col * scale + scale
      ) {
        let piece = mouse.selected.piece;
        move(piece, Math.floor(mouse.position.x / scale), Math.floor(mouse.position.y / scale), true);
        mouse.selected = { id: Math.random() * 1000 };
      }
    }
  })

}
window.onmouseup = function() {
  mouse.down = false;
}
window.onmousemove = function(e) {
  let rect = canvas.getBoundingClientRect();
  mouse.position.x = e.x - rect.left;
  mouse.position.y = e.y - rect.top;

  tiles.forEach((tile) => {
    if (
      mouse.position.x > tile.row * scale &&
      mouse.position.x < tile.row * scale + scale &&
      mouse.position.y > tile.col * scale &&
      mouse.position.y < tile.col * scale + scale
    ) {
      tile.color = "red";
    } else {
      tile.color = (mouse.selected.id == tile.id) ? "green" : tile.c;
    }
  })
}

function hasPiece(tile) {
  for(let i = 0; i < pieces.length; i++) {
    let piece = pieces[i];
    if (tile.col == piece.col && tile.row == piece.row) {
      tile.piece = piece;
      return true;
    }
  }
  tile.piece = null;
  return false;
}

function move(piece, row, col, sendOver) {
  if (piece.type == TYPE.PESHKA_WHITE || piece.type == TYPE.PESHKA_BLACK) {
    if (vaildPeshkaMove(piece, row, col)) { //if the move is vaild
      whiteTurn = !whiteTurn; //switch to other player's turn and move the piece
      piece.row = row;
      piece.col = col;
      sendData(sendOver, piece, row, col);
    } else { //if not vaild check if pawn can kill another piece
      let killed = findPeshkaKill(piece, row, col);
      if (killed != null && killed.type != piece.type) { //if can kill someone delete them and move to their spot
        whiteTurn = !whiteTurn; //switch to other player's turn
        piece.col = killed.col;
        piece.row = killed.row;
        sendData(sendOver, piece, row, col);
        pieces.splice(killed.index, 1);
      }

    }
  }
  if (piece.type == TYPE.KING_WHITE || piece.type == TYPE.KING_BLACK) {
    if (vaildKingMove(piece, row, col)) {
      whiteTurn = !whiteTurn; //switch turn
      let kill = findKingKill(piece, row, col);
      if (kill != null) { //if there is a piece in the way eat it
        pieces.splice(kill.index, 1);
      }
      piece.row = row; //move to the desired player position
      piece.col = col;
      sendData(sendOver, piece, row, col);
    }
  }
  if (piece.type == TYPE.BASHNYA_WHITE || piece.type == TYPE.BASHNYA_BLACK) {
    if (validBashnyaMove(piece, row, col)) {
      whiteTurn = !whiteTurn;
      let kill = findBashnyaKill(piece, row, col);
      if (kill != null) pieces.splice(kill.index, 1);
      piece.row = row;
      piece.col = col;
      sendData(sendOver, piece, row, col);
    }
  }
  if (piece.type == TYPE.KON_WHITE || piece.type == TYPE.KON_BLACK) {
    if (validKonMove(piece, row, col)) {
      whiteTurn = !whiteTurn;
      let kill = findKonKill(piece, row, col);
      if (kill != null) pieces.splice(kill.index, 1);
      piece.row = row;
      piece.col = col;
      sendData(sendOver, piece, row, col);
    }
  }
  if (piece.type == TYPE.OFFICER_WHITE || piece.type == TYPE.OFFICER_BLACK) {
    if (validOfficerMove(piece, row, col)) {
      whiteTurn = !whiteTurn;
      let kill = findOfficerKill(piece, row, col);
      if (kill != null) pieces.splice(kill.index, 1);
      piece.row = row;
      piece.col = col;
      sendData(sendOver, piece, row, col);
    }
  }
  if (piece.type == TYPE.QUEEN_BLACK || piece.type == TYPE.QUEEN_WHITE) {
    if (validQueenMove(piece, row, col)) {
      whiteTurn = !whiteTurn;
      let kill = findQueenKill(piece, row, col);
      if (kill != null) pieces.splice(kill.index, 1);
      piece.col = col;
      piece.row = row;
      sendData(sendOver, piece, row, col);
    }
  }
  
}
function sendData(sendOver, piece, row, col) {
  if (sendOver && connectionValid) {
    connection.send({ piece: piece.index, row, col });
  }
}

function findKingKill(piece, row, col) {
  for(let i = 0; i < pieces.length; i++) {
    let other = pieces[i];
    if (piece.index == other.index) continue;

    //if there is a piece at the col and row of where the player tried to go and it is killable return it
    if (row == other.row && col == other.col && vaildKingMove(piece, other.row, other.col)) return other;
  }

  return null;
}
function findBashnyaKill(piece, row, col) {
  for(let i = 0; i < pieces.length; i++) {
    let other = pieces[i];
    if (piece.index == other.index) continue;

    //if there is a piece at the col and row of where the player tried to go and it is killable return it
    if (row == other.row && col == other.col && validBashnyaMove(piece, other.row, other.col)) return other;
  }

  return null;
}
function findKonKill(piece, row, col) {
  for(let i = 0; i < pieces.length; i++) {
    let other = pieces[i];
    if (piece.index == other.index) continue;

    //if there is a piece at the col and row of where the player tried to go and it is killable return it
    if (row == other.row && col == other.col && validKonMove(piece, other.row, other.col)) return other;
  }

  return null;
}
function findOfficerKill(piece, row, col) {
  for(let i = 0; i < pieces.length; i++) {
    let other = pieces[i];
    if (piece.index == other.index) continue;

    //if there is a piece at the col and row of where the player tried to go and it is killable return it
    if (row == other.row && col == other.col && validOfficerMove(piece, other.row, other.col)) return other;
  }

  return null;
}
function findQueenKill(piece, row, col) {
  for(let i = 0; i < pieces.length; i++) {
    let other = pieces[i];
    if (piece.index == other.index) continue;

    //if there is a piece at the col and row of where the player tried to go and it is killable return it
    if (row == other.row && col == other.col && validQueenMove(piece, other.row, other.col)) return other;
  }

  return null;
}
function findPeshkaKill(piece, row, col) {
  for(let i = 0; i < pieces.length; i++) {
    let other = pieces[i];
    if (piece.index == other.index) continue;

    //if there is a piece at the col and row of where the player tried to go and it is killable return it
    if (row == other.row && col == other.col && vaildPeshkaKill(piece, other.row, other.col)) return other;
  }

  return null;
}

function vaildPeshkaKill(piece, row, col) {
  let diffX = Math.abs(piece.row - row);
  let diffY = piece.col - col;

  //if outside the board not a vaild kill
  if (diffX < 0 || Math.abs(diffY) < 0 || diffX > rows || Math.abs(diffY) > cols) return false;

  //bottom right and bottom left moves are vaild for black
  if (diffX == 1 && diffY == -1 && piece.type == TYPE.PESHKA_BLACK) return true;
  //top right and top left moves are vaild for white
  if (diffX == 1 && diffY == 1 && piece.type == TYPE.PESHKA_WHITE) return true;

  return false;
}

function vaildPeshkaMove(piece, row, col) {
  let diffX = piece.row - row;
  let diffY = piece.col - col;
  let tile = findTile(row, col);

  if (tile == null) return false; //if there is no tile to move to. dont move
  if (tile.piece != null) return false; //if the tile is already occupied

  if (Math.abs(diffX) < 0 || Math.abs(diffY) < 0 || Math.abs(diffX) > rows || Math.abs(diffY) > cols) return false; //moving outside of the map is prohibited

  if (diffX == 0 && diffY == -1 && piece.type == TYPE.PESHKA_BLACK) return true; //black pawns can only go down
  if (diffX == 0 && diffY == 1 && piece.type == TYPE.PESHKA_WHITE) return true; //white pawns can only go up

  if (Math.abs(diffY) > 0 && diffX == 0) { //vertical jump check
    for(let i = 0; i < pieces.length; i++) {
      let p = pieces[i];
      if (piece.index == p.index) continue;
      if (p.row == row && p.col > col && p.col < piece.col) return false;
      if (p.row == row && p.col < col && p.col > piece.col) return false;
    }
  }

  if (diffX == 0 && diffY == -2 && piece.type == TYPE.PESHKA_BLACK && piece.col == 1) return true; //double jump for the first time
  if (diffX == 0 && diffY == 2 && piece.type == TYPE.PESHKA_WHITE && piece.col == cols - 2) return true;

  return false;
}

function vaildKingMove(piece, row, col) {
  let diffX = Math.abs(piece.row - row);
  let diffY = Math.abs(piece.col - col);

  if (diffX < 0 || diffY < 0 || diffX > rows || diffY > cols) return false; //moving outside of the map is prohibited
  if (
    diffX == 1 && diffY == 1 || //diagonals
    diffX == 0 && diffY == 1 || //up / down
    diffX == 1 && diffY == 0 //left / right
  ) return true;

  return false;
}

function validBashnyaMove(piece, row, col) {
  let diffX = Math.abs(piece.row - row);
  let diffY = Math.abs(piece.col - col);

  if (diffX < 0 || diffY < 0 || diffX > rows || diffY > cols) return false; //moving outside of the map is prohibited

  if (diffY > 0 && diffX == 0) { //vertical jump check
    for(let i = 0; i < pieces.length; i++) {
      let p = pieces[i];
      if (piece.index == p.index) continue;
      if (p.row == row && p.col > col && p.col < piece.col) return false;
      if (p.row == row && p.col < col && p.col > piece.col) return false;
    }
  }
  if (diffX > 0 && diffY == 0) { //horizontal jump check
    for(let i = 0; i < pieces.length; i++) {
      let p = pieces[i];
      if (piece.index == p.index) continue;
      if (p.col == col && p.row > row && p.row < piece.row) return false;
      if (p.col == col && p.row < row && p.row > piece.row) return false;
    }
  }

  if (
    diffX > 0 && diffY == 0 || //left right
    diffY > 0 && diffX == 0 //up down
  ) return true;

  return false;
}

function validKonMove(piece, row, col) {
  let diffX = Math.abs(piece.row - row);
  let diffY = Math.abs(piece.col - col);

  if (diffX < 0 || diffY < 0 || diffX > rows || diffY > cols) return false; //moving outside of the map is prohibited

  if (diffX == 1 && diffY == 2 || diffX == 2 && diffY == 1) return true;

  return false;
}

function validOfficerMove(piece, row, col) {
  let diffX = Math.abs(piece.row - row);
  let diffY = Math.abs(piece.col - col);

  let dx = piece.row - row;
  let dy = piece.col - col;
  let mag = Math.sqrt(dx*dx + dy*dy);
  let n = { x: dx/mag, y: dy/mag }; // add an offset to give the ability to kill other pieces

  if (diffX < 0 || diffY < 0 || diffX > rows || diffY > cols) return false;

  if (castRay(piece, row + n.x, col + n.y) != null) return false; //if something in the way, dont jump

  if (diffX == diffY) return true;

  return false;
}

function validQueenMove(piece, row, col) {
  //merging classes is sooo easy!
  return (validBashnyaMove(piece, row, col) || validOfficerMove(piece, row, col));
}

function castRay(piece, row, col) {
  for(let i = 0; i < pieces.length; i++) {
    let p = pieces[i];
    if (p.index == piece.index) continue;
    if (linePoint(piece.row * scale, piece.col * scale, row * scale, col * scale, p.row * scale, p.col * scale)) return p;
  }
  return null;
}

function linePoint(x1, y1, x2, y2, x, y) {
  let dxl = x1 - x2;
  let dyl = y1 - y2;
  let len = Math.sqrt(dxl*dxl + dyl*dyl);

  let dya = y - y1;
  let dxa = x - x1;
  let dyb = y - y2;
  let dxb = x - x2;

  let da = Math.sqrt(dxa*dxa + dya*dya);
  let db = Math.sqrt(dxb*dxb + dyb*dyb);

  return (da+db == len) ? true : false;
}

function findTile(row, col) {
  for(let i = 0; i < tiles.length; i++) {
    if (tiles[i].col == col && tiles[i].row == row) return tiles[i];
  }
  return null;
}
function displayMessage(text, callback) {
  message.style.visibility = "visible";
  button.onclick = function() {this.parentElement.style.visibility = "hidden"; callback();};

  messageText.innerText = text;
}

function lerp(a, b, t) {
  return (b-a) * t;
}