import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import {CreateUserSchema, SignInSchema, CreateRoomSchema} from "@repo/common/types"
import { prismaClient } from "@repo/db/client"

const app = express();


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

    return res.json({ userId: "123" });
  } catch (error) {
    return res.status(411).json({message: "user already exists with this email"})
  }

});

app.post("/signin", (req, res) => {
  // db call here

  const data = SignInSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ message: "Incorrect data", errors: data.error});
  }

  const userId = "123";
  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
  );

  res.json({
    token,
  });
});

app.post("/room", (req, res) => {
  // db call here
  const data = CreateRoomSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ message: "Incorrect data", errors: data.error });
  }

  res.json({
    roomId: 123,
  });
});
app.listen(PORT, () => {
  console.log("HTTP server running on port " + PORT);
});
