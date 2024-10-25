import { Router } from "express";
import { Review, ReviewResponse, ReviewsResponse } from "../types/review";

const router = Router();

router.get("/", async (req, res, next) => {
  // URL 쿼리에서 page와 limit를 가져옴
  const { page, limit, userId, bookId } = req.query as {
    page?: string;
    limit?: string;
    userId?: string;
    bookId?: string;
  };

  // 기본값 설정
  let sql: string;
  let values: Array<string | number> = [];
  let offset: number | null = null;
  let hasNextPage: boolean | null = null;

  if (userId) {
    try {
      sql = "SELECT * FROM reviews where userId = ? ORDER by id";
      values = [userId];

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
      return;
    } catch (error) {
      next(error);
    }
  }

  if (bookId) {
    try {
      sql = "SELECT * FROM reviews where bookId = ? ORDER by id";
      values = [bookId];

      if (!req.poolConnection) {
        throw new Error("Database connection not found");
      }

      const [rows] = await req.poolConnection.query(sql, values);
      const reviews = rows as Review[];

      if (reviews.length === 0) {
        res
          .status(404)
          .json({ message: "해당 책 리뷰 목록을 찾을 수 없습니다." });
        return;
      }

      const response: ReviewsResponse = {
        message: "책 리뷰 목록 조회 성공",
        reviews
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
    sql = "SELECT * FROM reviews LIMIT ? OFFSET ?";
    values = [parseInt(limit), offset];

    const totalReviews = 500;
    hasNextPage = offset + parseInt(limit) < totalReviews;
  } else {
    // 페이지네이션이 없는 경우
    sql = "SELECT * FROM reviews";
  }

  try {
    // 데이터베이스 연결 및 쿼리 실행
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const reviews = rows as Review[];

    // 응답 객체 생성
    const response: ReviewsResponse = {
      message: "리뷰 목록 조회 성공",
      reviews
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
  const sql = "SELECT * FROM reviews WHERE id=?";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const review = (rows as Review[])[0];

    if (!review) {
      res.status(404).json({ message: "해당 리뷰를 찾을 수 없습니다." });
      return;
    }

    const response: ReviewResponse = {
      message: "리뷰 조회 성공",
      review
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { rating = 0, content = "" } = req.body;

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      id: 501,
      rating,
      content,
      createdAt: new Date(),
      userId: 1,
      booksId: 1
    };
    res.status(201).json({
      message: "리뷰 생성 성공",
      comment: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, content } = req.body;

    const sql = "SELECT * FROM reviews WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const review = (rows as Review[])[0];

    if (!review) {
      res.status(404).json({ message: "해당 리뷰가 존재하지 않습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...review,
      rating,
      content
    };

    res.status(200).json({
      message: "리뷰 수정 성공",
      review: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, content } = req.body;

    const sql = "SELECT * FROM reviews WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const review = (rows as Review[])[0];

    if (!review) {
      res.status(404).json({ message: "해당 리뷰가 존재하지 않습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...review,
      ...(rating !== undefined && { rating }),
      ...(content !== undefined && { content })
    };

    res.status(200).json({
      message: "리뷰 수정 성공",
      review: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = "SELECT * FROM reviews WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const review = (rows as Review[])[0];

    if (!review) {
      res.status(404).json({ message: "해당 리뷰가 존재하지 않습니다." });
      return;
    }

    res.status(200).json({
      message: `${id}번 리뷰 삭제 성공`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
