// Anime Clash online server: serves the game page and relays inputs between two players per room.
// Rooms have a 4-letter code; public rooms that are still waiting for a second player show in the lobby.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I or O, they read like 1 and 0
const ROOM_TTL = 30 * 60 * 1000; // waiting rooms close after 30 minutes

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/healthz') {
    res.writeHead(200, { 'content-type': 'text/plain' });
    return res.end('ok');
  }
  if (url === '/' || url === '/index.html') {
    fs.readFile(INDEX, (err, data) => {
      if (err) { res.writeHead(500); return res.end('index.html missing'); }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
      res.end(data);
    });
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
});

const wss = new WebSocketServer({ server, maxPayload: 16 * 1024 });
const rooms = new Map();
const lobby = new Set();

const send = (ws, msg) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); };

function newCode() {
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  } while (rooms.has(code));
  return code;
}

function lobbyList() {
  return [...rooms.values()]
    .filter(r => r.pub && !r.players[1])
    .map(r => ({ code: r.code, since: r.created }));
}

function pushLobby() {
  const msg = JSON.stringify({ t: 'lobby', rooms: lobbyList() });
  for (const ws of lobby) if (ws.readyState === 1) ws.send(msg);
}

// A room only makes sense with both players, so when either leaves the room closes.
function leave(ws) {
  const room = ws.room;
  if (!room) return;
  ws.room = null;
  for (const p of room.players) {
    if (p && p !== ws) { p.room = null; send(p, { t: 'peerLeft' }); }
  }
  rooms.delete(room.code);
  pushLobby();
}

wss.on('connection', ws => {
  ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    switch (msg.t) {
      case 'r': { // game data for the other player, forwarded untouched
        const room = ws.room;
        const other = room && room.players[1 - ws.side];
        if (other && other.readyState === 1) other.send(raw.toString());
        break;
      }
      case 'list':
        lobby.add(ws);
        send(ws, { t: 'lobby', rooms: lobbyList() });
        break;
      case 'create': {
        leave(ws);
        const room = { code: newCode(), pub: !!msg.pub, players: [ws, null], created: Date.now() };
        rooms.set(room.code, room);
        ws.room = room;
        ws.side = 0;
        send(ws, { t: 'created', code: room.code, pub: room.pub });
        pushLobby();
        break;
      }
      case 'join': {
        const code = String(msg.code || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
        const room = rooms.get(code);
        if (!room) { send(ws, { t: 'err', msg: `No room with code ${code || '(blank)'}. Check the code and try again.` }); break; }
        if (room.players[0] === ws) break;
        if (room.players[1]) { send(ws, { t: 'err', msg: `Room ${code} already has two players.` }); break; }
        leave(ws);
        room.players[1] = ws;
        ws.room = room;
        ws.side = 1;
        send(ws, { t: 'joined', code, side: 1 });
        send(room.players[0], { t: 'peer' });
        pushLobby();
        break;
      }
      case 'leave':
        leave(ws);
        break;
    }
  });

  ws.on('close', () => { lobby.delete(ws); leave(ws); });
});

// Drop dead connections and rooms nobody joined.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false;
    ws.ping();
  }
  const now = Date.now();
  for (const room of rooms.values()) {
    if (!room.players[1] && now - room.created > ROOM_TTL) {
      send(room.players[0], { t: 'err', msg: 'Your room closed because nobody joined for 30 minutes.' });
      if (room.players[0]) room.players[0].room = null;
      rooms.delete(room.code);
      pushLobby();
    }
  }
}, 20000);

server.listen(PORT, () => console.log(`Anime Clash server listening on port ${PORT}`));
