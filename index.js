const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = [];
let notConnectedUser = null;

io.on("connection", (socket) => {
  socket.join(socket.id);

  socket.on("searchForGame", (id) => {
    if (notConnectedUser != null) { //if there is a user waiting for a game
      console.log("Game Found For " + notConnectedUser.socketId + " and " + socket.id);
      socket.emit("gameFound", notConnectedUser); //tell current user and waiting user that a game has been found
      io.to(notConnectedUser.socketId).emit("gameFound", { peerId: id, socketId: socket.id, goFirst: true });
      notConnectedUser = null; //set the waiting user to no one
    } else if (notConnectedUser == null) { //if there is no one waiting set us to the waiter
      console.log("User" + socket.id + " looking for game");
      notConnectedUser = { peerId: id, socketId: socket.id, goFirst: false };
    }
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

http.listen(3000, () => {
  console.log("Server is running on port 3000");
});