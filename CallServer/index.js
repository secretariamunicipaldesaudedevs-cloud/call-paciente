const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Só as pastas públicas (server.js, package.json e .env deixam de ficar expostos)
for (const dir of ["css", "src", "assets"]) {
  app.use(`/${dir}`, express.static(path.join(__dirname, dir)));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.get("/reload", (req, res) => {
  io.emit("reload");
  res.sendStatus(200);
});

app.get("/debug", (req, res) => {
  io.emit("debug");
  res.sendStatus(200);
});

const MAX_CHAMADAS = 11;
let chamadas = [];

const limpa = (valor, max = 80) => String(valor ?? "").trim().slice(0, max);

app.post("/", (req, res) => {
  const roomName = limpa(req.body.roomName);
  const currentPerson = limpa(req.body.currentPerson);
  const currentDoctor = limpa(req.body.currentDoctor);

  if (!roomName || !currentPerson) return res.sendStatus(400);

  chamadas.unshift({
    currentPerson,
    currentDoctor,
    roomName,
    time: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }),
  });
  chamadas = chamadas.slice(0, MAX_CHAMADAS);

  io.emit("newData", chamadas); // chamada nova: toca som e fala
  res.sendStatus(200);
});

io.on("connection", (socket) => {
  console.log("Painel conectado");
  socket.emit("init", chamadas); // painel recém-aberto ou reconectado: só desenha

  socket.on("disconnect", () => {
    console.log("Painel desconectado");
  });
});

server.listen(process.env.PORT || 53525, () => {
  console.log("listening on *:53525");
});