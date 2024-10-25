import { Router } from "express";
import { User, UserResponse } from "../types/user";
import { UsersResponse } from "../types/user";
import { Todo, TodosResponse } from "../types/todo";
import { Post, PostsResponse } from "../types/post";
import { Comment, CommentsResponse } from "../types/comment";
import { Review, ReviewsResponse } from "../types/review";

const router = Router();

router.get("/", async (req, res, next) => {
  // URL 쿼리에서 page와 limit를 가져옴
  const { page, limit } = req.query as { page?: string; limit?: string };

  // 기본값 설정
  let sql: string;
  let values: Array<number> = [];
  let offset: number | null = null;
  let hasNextPage: boolean | null = null;

  // 페이지네이션 처리
  if (page && limit) {
    offset = (parseInt(page) - 1) * parseInt(limit);

    // SQL 쿼리에 LIMIT과 OFFSET 적용
    sql = "SELECT * FROM users LIMIT ? OFFSET ?";
    values = [parseInt(limit), offset];

    // hasNextPage 계산 (예시로 totalUsers를 20으로 가정)
    const totalUsers = 20;
    hasNextPage = offset + parseInt(limit) < totalUsers;
  } else {
    // 페이지네이션이 없는 경우
    sql = "SELECT * FROM users";
  }

  try {
    // 데이터베이스 연결 및 쿼리 실행
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);

    // 응답 객체 생성
    const response: UsersResponse = {
      message: "유저 목록 조회 성공",
      users: rows as User[]
    };

    // 조건에 따라 page, limit, hasNextPage 추가
    if (page) response.page = parseInt(page);
    if (limit) response.limit = parseInt(limit);
    if (hasNextPage !== null) response.hasNextPage = hasNextPage;

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const sql = "SELECT * FROM users WHERE id=?";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const user = (rows as User[])[0];

    if (!user) {
      // 유저가 존재하지 않을 경우 404 Not Found 응답
      res.status(404).json({ message: "해당 유저를 찾을 수 없습니다." });
      return;
    }

    const response: UserResponse = {
      message: "유저 조회 성공",
      user
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/todos", async (req, res, next) => {
  const { id } = req.params;
  const sql =
    "SELECT users.id, todos.id AS todoId, todos.content, todos.completed FROM users INNER JOIN todos ON users.id = todos.userId where users.id = ?;";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const todos = rows as Todo[];

    if (todos.length === 0) {
      res
        .status(404)
        .json({ message: "해당 유저 할 일 목록을 찾을 수 없습니다." });
        return;
    }

    const response: TodosResponse = {
      message: "유저 할 일 목록 조회 성공",
      todos
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/posts", async (req, res, next) => {
  const { id } = req.params;
  const sql =
    "SELECT users.id, posts.id AS postId, posts.title, posts.content, posts.imgUrl, posts.createdAt FROM users INNER JOIN posts ON users.id = posts.userId where users.id = ?;";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const posts = rows as Post[];
    
    if (posts.length === 0) {
      res
        .status(404)
        .json({ message: "해당 유저 게시물 목록을 찾을 수 없습니다." });
        return;
    }

    const response: PostsResponse = {
      message: "유저 게시물 목록 조회 성공",
      posts
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/comments", async (req, res, next) => {
  const { id } = req.params;
  const sql =
    "SELECT users.id, comments.id AS commentId, comments.content, comments.createdAt FROM users INNER JOIN comments ON users.id = comments.userId where users.id = ?;";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const comments = rows as Comment[];

    if (comments.length === 0) {
      res
        .status(404)
        .json({ message: "해당 유저 댓글 목록을 찾을 수 없습니다." });
        return;
    }

    const response: CommentsResponse = {
      message: "유저 댓글 목록 조회 성공",
      comments
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/reviews", async (req, res, next) => {
  const { id } = req.params;
  const sql =
    "SELECT users.id, reviews.id AS reviewId, reviews.rating, reviews.content, reviews.createdAt FROM users INNER JOIN reviews ON users.id = reviews.userId where users.id = ?;";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const reviews = rows as Review[];

    if (reviews.length === 0) {
      res
        .status(404)
        .json({ message: "해당 유저 리뷰 목록을 찾을 수 없습니다." });
        return;
    }

    const response: ReviewsResponse = {
      message: "유저 리뷰 목록 조회 성공",
      reviews
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { username, email, phone, address } = req.body;

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      id: 21,
      username,
      phone,
      address,
      email,
      createdAt: new Date()
    };

    res.status(201).json({
      message: "유저 생성 성공",
      user: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { username = "", phone = "", address = "", email = "" } = req.body;

    const { id } = req.params;
    const sql = "SELECT * FROM users WHERE id=?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const user = (rows as User[])[0];

    if (!user) {
      // 유저가 존재하지 않을 경우 404 Not Found 응답
      res.status(404).json({ message: "해당 유저를 찾을 수 없습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      user: {
        ...user,
        username,
        email,
        phone,
        address
      }
    };

    const response = {
      message: "유저 수정 성공",
      user: dummyData
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { username, phone, address, email } = req.body;

    const { id } = req.params;
    const sql = "SELECT * FROM users WHERE id=?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const user = (rows as User[])[0];

    if (!user) {
      // 유저가 존재하지 않을 경우 404 Not Found 응답
      res.status(404).json({ message: "해당 유저를 찾을 수 없습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...user,
      ...(username !== undefined && { username }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address })
    };

    const response = {
      message: "유저 수정 성공",
      user: dummyData
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const sql = "SELECT * FROM users WHERE id = ?";
  const vaules = [id];

  if (!req.poolConnection) {
    throw new Error("Database connection not found");
  }

  const [rows] = await req.poolConnection.query(sql, vaules);
  const user = (rows as User[])[0];
  const response = { message: `${id}번 유저 삭제 성공` };

  if (!user) {
    res.status(404).json({
      message: "해당 유저를 찾을 수 없습니다."
    });
    return;
  }

  res.status(200).json(response);
});

export default router;
