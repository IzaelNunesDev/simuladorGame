const { WebSocketServer } = require("ws");
const { randomUUID } = require("crypto");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3001);
const TICK_RATE = 20;
const BROADCAST_INTERVAL_MS = Math.round(1000 / TICK_RATE);

const clients = new Map();

const server = new WebSocketServer({
  host: HOST,
  port: PORT,
});

server.on("connection", (socket) => {
  const id = randomUUID();
  clients.set(socket, {
    id,
    player: null,
  });

  socket.send(JSON.stringify({
    type: "welcome",
    id,
    tickRate: TICK_RATE,
    serverTime: Date.now(),
  }));

  socket.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString("utf8"));
    } catch (error) {
      console.warn("Mensagem invalida recebida.", error);
      return;
    }

    if (message.type === "state" && message.player) {
      const client = clients.get(socket);
      if (!client) {
        return;
      }

      client.player = {
        ...message.player,
        id: client.id,
        updatedAt: Date.now(),
      };
    }
  });

  socket.on("close", () => {
    const client = clients.get(socket);
    clients.delete(socket);
    if (!client) {
      return;
    }

    broadcast({
      type: "player_left",
      id: client.id,
    });
  });
});

const interval = setInterval(() => {
  const players = [];
  for (const client of clients.values()) {
    if (client.player) {
      players.push(client.player);
    }
  }

  broadcast({
    type: "snapshot",
    players,
    serverTime: Date.now(),
  });
}, BROADCAST_INTERVAL_MS);

server.on("close", () => {
  clearInterval(interval);
});

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const socket of clients.keys()) {
    if (socket.readyState === socket.OPEN) {
      socket.send(payload);
    }
  }
}

console.log(`Multiplayer relay ouvindo em ws://${HOST}:${PORT}`);
