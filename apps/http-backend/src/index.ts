import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
 
app.get("/api/data", (req, res) => {
  res.json({ message: "This is some data from the server!" });
});

app.listen(PORT, () => {
    console.log("HTTP server running on port " + PORT);
})

