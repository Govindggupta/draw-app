import {WebSocket, WebSocketServer} from 'ws' 
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const PORT = 8080;
const wss = new WebSocketServer({port: PORT}); 

interface User {
  ws: WebSocket, 
  rooms: string[],
  userId : string
}

const users: User[] = []

function checkUser(token: string) : string | null {
  try {
    const decoded = jwt.verify(token as string, JWT_SECRET);

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }
}


wss.on("connection", (ws , request) => {
  console.log("Client connected");

  const url =  request.url; 
  if ( !url ) {
    ws.send("No URL provided");
    return;
  }

  const urlQueryParams = new URLSearchParams(url.split("?")[1]);
  const token = urlQueryParams.get("token") || ""; 
  const userId = checkUser(token); 

  if (userId == null) {
    ws.send("Invalid token");
    ws.close(); 
    return null;
  }

  users.push({
    userId, 
    rooms:[], 
    ws
  })

  ws.on("message", async (message) => {

    const parsedData = JSON.parse(message as unknown as string);

    if (parsedData.type === "join_room") {
      const roomId = parsedData.roomId;
      const user = users.find(u => u.ws === ws);
      user?.rooms.push(roomId)
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(u => u.ws === ws);
      if (!user){
        return;
      }
      user.rooms = user?.rooms.filter(r => r === parsedData.roomId)
    }

    if ( parsedData.type === "message") {
      const room = parsedData.roomId;
      const message = parsedData.message;

      await prismaClient.chat.create({
        data: {
          roomId: room,
          message: message, 
          userId: userId
        }
      })

      users.forEach(u => {
        if (u.rooms.includes(room)) {
          u.ws.send(JSON.stringify({
            type: "chat" , 
            message: message, 
            room: room,
            sender: userId
          }))
        }
      })
    }
    

  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
