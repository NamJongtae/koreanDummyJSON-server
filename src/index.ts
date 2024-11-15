import express from "express";
import path from "path";
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
import favicon from "serve-favicon";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(poolConnection);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.static("public"));
app.use(favicon(path.join(__dirname, "..", "public/images", "favicon.ico")));

app.use("/users", requestCounter, usersRouter);
app.use("/posts", requestCounter, postsRouter);
app.use("/comments", requestCounter, commentsRouter);
app.use("/todos", requestCounter, todosRouter);
app.use("/books", requestCounter, booksRouter);
app.use("/reviews", requestCounter, reviewsRouter);
app.use("/auth", requestCounter, authRouter);
app.use("/image", requestCounter, imageRouter);
app.use("/request-count", requestCountRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.BASE_URL}`);
});
