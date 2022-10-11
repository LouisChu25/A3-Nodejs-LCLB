const http = require("http"),
  express = require("express"),
  app = express(),
  socketIo = require("socket.io");
const fs = require("fs");
const mongoose = require('mongoose'); // On définit les constantes 

mongoose.connect('mongodb+srv://louis:gm9H_.y6bu.UPmK@cluster0.nsvtase.mongodb.net/?retryWrites=true&w=majority', 
{useNewUrlParser: true
}).then(() => {
    console.log('Connnexion réussie') // On se connecte à ma base de données en ligne MongoDB Atlas 
}).catch((error) => {
    console.log(error);
});

const server = http.Server(app).listen(8080); // On définit le port du serveur 
const io = socketIo(server);
const clients = {};

app.use(express.static(__dirname + "/../nodejsprojet/client/")); // Lier express avec les fichiers statiques 
app.use(express.static(__dirname + "/../nodejsprojet/node_modules/"));

app.get("/", (req, res) => {
  const stream = fs.createReadStream(__dirname + "/../nodejsprojet/client/index.html");
  stream.pipe(res);  // On définit la route de base sur le fichier index.html
});

const addClient = socket => { // On gère les utilisateurs avec les sockets
  console.log("New client connected", socket.id);
  clients[socket.id] = socket;
};
const removeClient = socket => {
  console.log("Client disconnected", socket.id);
  delete clients[socket.id];
};

io.sockets.on("connection", socket => {
  let id = socket.id;

  addClient(socket);

  socket.on("mousemove", data => {
    data.id = id;
    socket.broadcast.emit("moving", data);
  });

  socket.on("disconnect", () => {
    removeClient(socket);
    socket.broadcast.emit("clientdisconnect", id);
  });
});

var players = {}, // On stocke la variable joueur
  unmatched;

function joinGame(socket) {  // Fonction pour commencer la partie
  players[socket.id] = {
    opponent: unmatched,
    symbol: "X",

    socket: socket
  };

  if (unmatched) {
    players[socket.id].symbol = "O";
    players[unmatched].opponent = socket.id;
    unmatched = null;
  } else {
    unmatched = socket.id;
  }
}

function getOpponent(socket) {
  if (!players[socket.id].opponent) {
    return;
  }

  return players[players[socket.id].opponent].socket;
}

io.on("connection", function(socket) {
  joinGame(socket);


  if (getOpponent(socket)) {
    socket.emit("game.begin", {
      symbol: players[socket.id].symbol
    });

    getOpponent(socket).emit("game.begin", {
      symbol: players[getOpponent(socket).id].symbol
    });
  }

 
  socket.on("make.move", function(data) {
    if (!getOpponent(socket)) {
      return;
    }

    socket.emit("move.made", data);
    getOpponent(socket).emit("move.made", data);
  });

  socket.on("disconnect", function() {
    if (getOpponent(socket)) {
      getOpponent(socket).emit("opponent.left");
    }
  });
});
