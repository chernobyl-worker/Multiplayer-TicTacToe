const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const uuid = require("uuid");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")))

app.post("/game", (req, res) => {
    console.log(req.body);
    if(req.body.mode === "online") {
        res.sendFile("/game.html", {root: "./public"});
    } else {
        res.send("Offline games not implemented yet !!");
    }
});

let gameQueue = [];
io.on("connection", (socket) => {
    if(gameQueue.length > 0) {
        let room = gameQueue[0]; 
        gameQueue.shift();
        socket.join(room);
        socket.emit("mark", "o");
        io.to(room).emit('room-full', room);
    } else {
        let room = uuid.v4();
        socket.join(room);
        gameQueue.push(room);
        socket.emit('mark', "x");
    }

    socket.on('move', ({i, j, roomID}) => {
        // console.log(i, j, roomID);
        socket.broadcast.to(roomID).emit("opponentMove",{row:i, col:j});
    });
    
    socket.on('win', (roomID) => {
        socket.broadcast.to(roomID).emit('loss');
    });
    
    socket.on('draw', (roomID) => {
        socket.broadcast.to(roomID).emit('draw');
    });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`Server started on port ${PORT}`));