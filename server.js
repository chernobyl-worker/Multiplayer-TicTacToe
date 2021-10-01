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
    if (req.body.mode === "online") {
        res.sendFile("/game.html", { root: "./public" });
    } else {
        res.send("Offline games not implemented yet !!");
    }
});

let gameQueue = [];
io.on("connection", (socket) => {
    let player;
    while (gameQueue.length > 0) {
        player = gameQueue.shift();
        if (player.connected)
            break;
    }
    if (player !== undefined && player.connected) {
        let room = uuid.v4();
        player.join(room);
        player.emit("mark", "x");
        socket.join(room);
        socket.emit("mark", "o");
        io.to(room).emit("room-full", room);
    } else {
        gameQueue.push(socket);
    }
    // if (gameQueue.length > 0) {
    //     let room = gameQueue[0];
    //     gameQueue.shift();
    //     socket.join(room);
    //     socket.emit("mark", "o");
    //     io.to(room).emit('room-full', room);
    // } else {
    //     let room = uuid.v4();
    //     socket.join(room);
    //     gameQueue.push(room);
    //     socket.emit('mark', "x");
    // }

    socket.on('move', ({ i, j, roomID }) => {
        // console.log(i, j, roomID);
        socket.broadcast.to(roomID).emit("opponentMove", { row: i, col: j });
    });

    socket.on('win', (roomID) => {
        socket.broadcast.to(roomID).emit('loss');
    });

    socket.on('draw', (roomID) => {
        socket.broadcast.to(roomID).emit('draw');
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {
            socket.broadcast.to(room).emit('leaver');
        });
    });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`Server started on port ${PORT}`));