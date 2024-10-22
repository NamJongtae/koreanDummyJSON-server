import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.BASE_URL}`);
});
