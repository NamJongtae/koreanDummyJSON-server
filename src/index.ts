import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users";
import postsRouter from "./routes/posts";
import commentsRouter from "./routes/comments";
import poolConnection from "./middlewares/poolConnection";
import errorHandler from "./middlewares/errorHandler";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(poolConnection);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/comments", commentsRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.BASE_URL}`);
});
