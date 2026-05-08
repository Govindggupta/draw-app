import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import {CreateUserSchema, SignInSchema, CreateRoomSchema} from "@repo/common/types"
import { prismaClient } from "@repo/db/client"
import middleware from "./middleware";

const app = express();
app.use(express.json());

const PORT = 5000;

app.post("/signup",async (req, res) => {

  const parsedData = CreateUserSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({ message: "Incorrect data", errors: parsedData.error });
  }
  try {
    
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.email,
        password: parsedData.data.password,
        name: parsedData.data.name,
      },
    });

    return res.status(200).json({ user: user });
  } catch (error) {
    return res.status(411).json({message: "user already exists with this email", errors: error
    })
  }

});

app.post("/signin", async (req, res) => {

  const parsedData = SignInSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({ message: "Incorrect data", errors: parsedData.error});
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.success ? parsedData.data.email : undefined,
      password: parsedData.success ? parsedData.data.password : undefined,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    {
      userId: user.id
    },
    JWT_SECRET,
  );

  return res.status(200).json({
    username : user.name,
    token : token
  })

});

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  
  if (!parsedData.success) {
    return res.status(400).json({ message: "Incorrect data", errors: parsedData.error });
  }

  //@ts-ignore
  const userId = req.userId; 

  await prismaClient.room.create({
    data: {
      slug: parsedData.data.name,
      adminId: userId
    }
  })

  res.status(200).json({
    roomId: parsedData.data.name,
  });
});
app.listen(PORT, () => {
  console.log("HTTP server running on port " + PORT);
});
