const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.get("/reload", (req, res) => {
    io.emit("reload");
    res.sendStatus(200);
});

let chamadas = [];
app.post("/", (req, res) => {
  // console.log("received a post");
  const { roomName, currentPerson, currentDoctor } = req.body;

  const newData = {
    currentPerson,
    currentDoctor,
    roomName,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  chamadas.unshift(newData);
  while (chamadas.length > 11) {
    chamadas.pop();
  }
  io.emit("newData", chamadas);
  
  //modificado jose mendez
  res.sendStatus(200);
});

io.on("connection", (socket) => {
  console.log("Painel conectado");

  socket.on("disconnect", () => {
    console.log("Painel desconectado");
  });
});

server.listen(53525, () => {
  console.log("listening on *:53525");
});
