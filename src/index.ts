import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users";
import postsRouter from "./routes/posts";
import commentsRouter from "./routes/comments";
import todosRouter from "./routes/todos";
import booksRouter from "./routes/books";
import reviewsRouter from "./routes/reviews";
import authRouter from "./routes/auth";
import imageRouter from "./routes/image";
import requestCountRouter from "./routes/requestCount";
import poolConnection from "./middlewares/poolConnection";
import errorHandler from "./middlewares/errorHandler";
import requestCounter from "./middlewares/requestCounter";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(poolConnection);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(requestCounter);
app.use(express.static("public"));

app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/comments", commentsRouter);
app.use("/todos", todosRouter);
app.use("/books", booksRouter);
app.use("/reviews", reviewsRouter);
app.use("/auth", authRouter);
app.use("/image", imageRouter);
app.use("/request-count", requestCountRouter);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.BASE_URL}`);
});
