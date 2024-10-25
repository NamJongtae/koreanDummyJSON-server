import { Router } from "express";
import { Post, PostResponse, PostsResponse } from "../types/post";
import { CommentsResponse, Comment } from "../types/comment";

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
    sql = "SELECT * FROM posts LIMIT ? OFFSET ?";
    values = [parseInt(limit), offset];

    const totalPosts = 100;
    hasNextPage = offset + parseInt(limit) < totalPosts;
  } else {
    // 페이지네이션이 없는 경우
    sql = "SELECT * FROM posts";
  }

  try {
    // 데이터베이스 연결 및 쿼리 실행
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);

    // 응답 객체 생성
    const response: PostsResponse = {
      message: "게시물 목록 조회 성공",
      posts: rows as Post[]
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
  const sql = "SELECT * FROM posts WHERE id=?";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const post = (rows as Post[])[0];

    if (!post) {
      res.status(404).json({ message: "해당 게시물을 찾을 수 없습니다." });
      return;
    }

    const response: PostResponse = {
      message: "게시물 조회 성공",
      post
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/comments", async (req, res, next) => {
  const { id } = req.params;
  const sql =
    "SELECT posts.id, comments.id AS commentId, comments.content, comments.createdAt FROM posts INNER JOIN comments ON posts.id = comments.postId where posts.id = ?";
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
        .json({ message: "해당 게시물 댓글 목록을 찾을 수 없습니다." });
        return;
    }

    const response: CommentsResponse = {
      message: "게시물 댓글 목록 조회 성공",
      comments
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title = "", content = "", imgUrl = "" } = req.body;

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      id: 101,
      title,
      content,
      imgUrl,
      createdAt: new Date(),
      userId: 1
    };
    res.status(201).json({
      message: "게시물 생성 성공",
      post: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title = "", content = "", imgUrl = "" } = req.body;

    const sql = "SELECT * FROM posts WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection.query(sql, values);
    const post = (rows as Post[])[0];

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...post,
      title,
      content,
      imgUrl
    };

    const response = {
      message: "게시물 수정 성공",
      post: dummyData
    };

    if (!post) {
      res.status(404).json({
        message: "해당 게시물을 찾을 수 없습니다."
      });
      return;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, imgUrl } = req.body;

    const sql = "SELECT * FROM posts WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection.query(sql, values);
    const post = (rows as Post[])[0];

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...post,
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(imgUrl !== undefined && { imgUrl })
    };

    const response = {
      message: "게시물 수정 성공",
      post: dummyData
    };

    if (!post) {
      res.status(404).json({
        message: "해당 게시물을 찾을 수 없습니다."
      });
      return;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const sql = "SELECT * FROM posts WHERE id = ?";
  const vaules = [id];

  if (!req.poolConnection) {
    throw new Error("Database connection not found");
  }

  const [rows] = await req.poolConnection.query(sql, vaules);
  const post = (rows as Post[])[0];
  const response = { message: `${id}번 게시물 삭제 성공` };

  if (!post) {
    res.status(404).json({
      message: "해당 게시물을 찾을 수 없습니다."
    });
    return;
  }

  res.status(200).json(response);
});

export default router;
