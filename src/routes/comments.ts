import { Router } from "express";
import { Comment, CommentResponse, CommentsResponse } from "../types/comment";

const router = Router();

router.get("/", async (req, res, next) => {
  // URL 쿼리에서 page와 limit를 가져옴
  const { page, limit, userId, postId } = req.query as {
    page?: string;
    limit?: string;
    userId?: string;
    postId?: string;
  };

  // 기본값 설정
  let sql: string;
  let values: Array<string | number> = [];
  let offset: number | null = null;
  let hasNextPage: boolean | null = null;

  if (userId) {
    try {
      sql = "SELECT * FROM comments where userId = ? ORDER by id";
      values = [userId];

      if (!req.poolConnection) {
        throw new Error("Database connection not found");
      }

      const [rows] = await req.poolConnection.query(sql, values);
      const response: CommentsResponse = {
        message: "유저 댓글 목록 조회 성공",
        comments: rows as Comment[]
      };

      res.status(200).json(response);
      return;
    } catch (error) {
      next(error);
    }
  }

  if (postId) {
    try {
      sql = "SELECT * FROM comments where postId = ? ORDER by id";
      values = [postId];

      if (!req.poolConnection) {
        throw new Error("Database connection not found");
      }

      const [rows] = await req.poolConnection.query(sql, values);
      const response: CommentsResponse = {
        message: "게시물 댓글 목록 조회 성공",
        comments: rows as Comment[]
      };

      res.status(200).json(response);
      return;
    } catch (error) {
      next(error);
    }
  }

  // 페이지네이션 처리
  if (page && limit) {
    offset = (parseInt(page) - 1) * parseInt(limit);

    // SQL 쿼리에 LIMIT과 OFFSET 적용
    sql = "SELECT * FROM comments LIMIT ? OFFSET ?";
    values = [parseInt(limit), offset];

    const totalComments = 500;
    hasNextPage = offset + parseInt(limit) < totalComments;
  } else {
    // 페이지네이션이 없는 경우
    sql = "SELECT * FROM comments";
  }

  try {
    // 데이터베이스 연결 및 쿼리 실행
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);

    // 응답 객체 생성
    const response: CommentsResponse = {
      message: "댓글 목록 조회 성공",
      comments: rows as Comment[]
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
  const sql = "SELECT * FROM comments WHERE id=?";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const comment = (rows as Comment[])[0];

    if (!comment) {
      // 유저가 존재하지 않을 경우 404 Not Found 응답
      res.status(404).json({ message: "해당 댓글을 찾을 수 없습니다." });
      return;
    }

    const response: CommentResponse = {
      message: "댓글 조회 성공",
      comment
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { content = "" } = req.body;

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      id: 501,
      content,
      createdAt: new Date(),
      userId: 1,
      postId: 1
    };
    res.status(201).json({
      message: "댓글 생성 성공",
      comment: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const sql = "SELECT * FROM comments WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const comment = (rows as Comment[])[0];

    if (!comment) {
      res.status(404).json({ message: "해당 댓글이 존재하지 않습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...comment,
      ...(content !== undefined && { content })
    };

    res.status(200).json({
      message: "댓글 수정 성공",
      comment: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content = "" } = req.body;

    const sql = "SELECT * FROM comments WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const comment = (rows as Comment[])[0];

    if (!comment) {
      res.status(404).json({ message: "해당 댓글이 존재하지 않습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...comment,
      content
    };

    res.status(200).json({
      message: "댓글 수정 성공",
      comment: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = "SELECT * FROM comments WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const comment = (rows as Comment[])[0];

    if (!comment) {
      res.status(404).json({ message: "해당 댓글이 존재하지 않습니다." });
      return;
    }

    res.status(200).json({
      message: `${id}번 댓글 삭제 성공`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
