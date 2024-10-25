import { Router } from "express";
import { Book, BookResponse, BooksResponse } from "../types/book";
import { Review, ReviewsResponse } from '../types/review';

const router = Router();

router.get("/", async (req, res, next) => {
  // URL 쿼리에서 page와 limit를 가져옴
  const { page, limit } = req.query as {
    page?: string;
    limit?: string;
  };

  // 기본값 설정
  let sql: string;
  let values: Array<string | number> = [];
  let offset: number | null = null;
  let hasNextPage: boolean | null = null;

  // 페이지네이션 처리
  if (page && limit) {
    offset = (parseInt(page) - 1) * parseInt(limit);

    // SQL 쿼리에 LIMIT과 OFFSET 적용
    sql = "SELECT * FROM books LIMIT ? OFFSET ?";
    values = [parseInt(limit), offset];

    const totalBooks = 100;
    hasNextPage = offset + parseInt(limit) < totalBooks;
  } else {
    // 페이지네이션이 없는 경우
    sql = "SELECT * FROM books";
  }

  try {
    // 데이터베이스 연결 및 쿼리 실행
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);

    // 응답 객체 생성
    const response: BooksResponse = {
      message: "책 목록 조회 성공",
      books: rows as Book[]
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
  const sql = "SELECT * FROM books WHERE id=?";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const book = (rows as Book[])[0];

    if (!book) {
      res.status(404).json({ message: "해당 책을 찾을 수 없습니다." });
      return;
    }

    const response: BookResponse = {
      message: "할 일 조회 성공",
      book
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/reviews", async (req, res, next) => {
  const { id } = req.params;
  const sql = "SELECT books.id, reviews.id AS reviewId, reviews.rating, reviews.content, reviews.createdAt FROM books INNER JOIN reviews ON books.id = reviews.bookId where books.id = ?";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const reviews = rows as Review[];

    if (reviews.length === 0) {
      res.status(404).json({ message: "해당 책 리뷰 목록을 찾을 수 없습니다." });
      return;
    }

    const response: ReviewsResponse = {
      message: "책 리뷰 목록 조회 성공",
      reviews
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      author = "",
      genre = "",
      title = "",
      publicationDate = "",
      totalPage = 0
    } = req.body;

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      id: 101,
      author,
      genre,
      title,
      publicationDate: publicationDate
        ? new Date(publicationDate).toISOString()
        : publicationDate,
      totalPage
    };
    res.status(201).json({
      message: "책 생성 성공",
      book: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      author,
      genre,
      title,
      publicationDate ,
      totalPage,
    } = req.body;

    const sql = "SELECT * FROM books WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const book = (rows as Book[])[0];

    if (!book) {
      res.status(404).json({ message: "해당 책이 존재하지 않습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...book,
      author,
      genre,
      title,
      publicationDate: publicationDate
        ? new Date(publicationDate).toISOString()
        : publicationDate,
      totalPage
    };

    res.status(200).json({
      message: "책 수정 성공",
      book: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { author, genre, title, publicationDate, totalPage } = req.body;

    const sql = "SELECT * FROM books WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const book = (rows as Book[])[0];

    if (!book) {
      res.status(404).json({ message: "해당 책이 존재하지 않습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...book,
      ...(author !== undefined && { author }),
      ...(genre !== undefined && { genre }),
      ...(title !== undefined && { title }),
      ...(totalPage !== undefined && { totalPage }),
      ...(publicationDate !== undefined && {
        publicationDate: new Date(publicationDate).toISOString()
      })
    };

    res.status(200).json({
      message: "책 수정 성공",
      comment: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = "SELECT * FROM books WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const book = (rows as Book[])[0];

    if (!book) {
      res.status(404).json({ message: "해당 책이 존재하지 않습니다." });
      return;
    }

    res.status(200).json({
      message: `${id}번 책 삭제 성공`
    });
  } catch (error) {
    next(error);
  }
});

export default router;

