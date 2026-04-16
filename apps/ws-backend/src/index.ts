import {WebSocketServer} from 'ws' 

const PORT = 8080;
const wss = new WebSocketServer({port: PORT}); 

console.log(`WebSocket server running on port ${PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    ws.send(`Echo: ${message}, Sent from the server running at the ${PORT}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
