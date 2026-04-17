import {WebSocketServer} from 'ws' 
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";

const PORT = 8080;
const wss = new WebSocketServer({port: PORT}); 


wss.on("connection", (ws , request) => {
  console.log("Client connected");


  const url =  request.url; 
  if ( !url ) {
    ws.send("No URL provided");
    return;
  }

  const urlQueryParams = new URLSearchParams(url.split("?")[1]);
  const token = urlQueryParams.get("token"); 
  const decoded = jwt.verify(token as string, JWT_SECRET);

  if (typeof decoded === "string") {
    ws.send("Invalid token");
    ws.close();
    return;
  }

  if (!decoded || !decoded.userId) {
    ws.send("Invalid token");
    ws.close();
    return;
  }

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    ws.send(`Echo: ${message}, Sent from the server running at the ${PORT}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
