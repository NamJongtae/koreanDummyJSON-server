import { Router } from "express";
import { Todo, TodoResponse, TodosResponse } from "../types/todo";

const router = Router();

router.get("/", async (req, res, next) => {
  // URL 쿼리에서 page와 limit를 가져옴
  const { page, limit, userId } = req.query as {
    page?: string;
    limit?: string;
    userId?: string;
  };

  // 기본값 설정
  let sql: string;
  let values: Array<string | number> = [];
  let offset: number | null = null;
  let hasNextPage: boolean | null = null;

  if (userId) {
    try {
      sql = "SELECT * FROM todos where userId = ? ORDER by id";
      values = [userId];

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
        todos,
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
    sql = "SELECT * FROM todos LIMIT ? OFFSET ?";
    values = [parseInt(limit), offset];

    const totalTodos = 200;
    hasNextPage = offset + parseInt(limit) < totalTodos;
  } else {
    // 페이지네이션이 없는 경우
    sql = "SELECT * FROM todos";
  }

  try {
    // 데이터베이스 연결 및 쿼리 실행
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);

    // 응답 객체 생성
    const response: TodosResponse = {
      message: "할 일 목록 조회 성공",
      todos: rows as Todo[]
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
  const sql = "SELECT * FROM todos WHERE id=?";
  const values = [id];

  try {
    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }
    const [rows] = await req.poolConnection.query(sql, values);
    const todo = (rows as Todo[])[0];

    if (!todo) {
      res.status(404).json({ message: "해당 할 일을 찾을 수 없습니다." });
      return;
    }

    const response: TodoResponse = {
      message: "할 일 조회 성공",
      todo
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
      id: 201,
      content,
      completed: 0,
      createdAt: new Date(),
      userId: 1
    };
    res.status(201).json({
      message: "할 일 생성 성공",
      todo: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, completed } = req.body;

    const sql = "SELECT * FROM todos WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const todo = (rows as Todo[])[0];

    if (!todo) {
      res.status(404).json({ message: "해당 할 일이 존재하지 않습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...todo,
      content,
      completed
    };

    res.status(200).json({
      message: "할 일 수정 성공",
      todo: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, completed } = req.body;

    const sql = "SELECT * FROM todos WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const todo = (rows as Todo[])[0];

    if (!todo) {
      res.status(404).json({ message: "해당 할 일이 존재하지 않습니다." });
      return;
    }

    // 더미 데이터를 만듭니다 (실제 DB 수정 대신)
    const dummyData = {
      ...todo,
      ...(completed !== undefined && { completed }),
      ...(content !== undefined && { content })
    };

    res.status(200).json({
      message: "할 일 수정 성공",
      todo: dummyData
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = "SELECT * FROM todos WHERE id = ?";
    const values = [id];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    const [rows] = await req.poolConnection?.query(sql, values);
    const todo = (rows as Todo[])[0];

    if (!todo) {
      res.status(404).json({ message: "해당 할 일이 존재하지 않습니다." });
      return;
    }

    res.status(200).json({
      message: `${id}번 할 일 삭제 성공`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
