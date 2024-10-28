import { Router } from "express";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { date } = req.query as { date: string | null };
    let count;
    let sql = "SELECT requestCount from request_counts where requestDate = ?";
    const values = [date];

    if (!req.poolConnection) {
      throw new Error("Database connection not found");
    }

    if (date) {
      const [rows] = await req.poolConnection.query(sql, values);

      const result = rows as { requestCount: number }[] | null;

      count = result && result.length > 0 ? result[0].requestCount : 0;
    } else {
      sql = "SELECT SUM(requestCount) AS requestCount from request_counts";

      const [rows] = await req.poolConnection.query(sql, values);

      const result = rows as { requestCount: number }[] | null;

      count = result && result.length > 0 ? result[0].requestCount : 0;

      res.status(200).json({
        message: "요청 횟수 조회 성공",
        count
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const today = new Date();
  today.setHours(today.getHours() + 9); // UTC 시간을 KST로 변환
  const formattedToday = today.toISOString().split("T")[0];

  if (!req.poolConnection) {
    throw new Error("Database connection not found");
  }

  try {
    // 오늘 날짜의 요청 카운트 여부 확인
    const [rows] = await req.poolConnection?.query(
      "SELECT * FROM request_counts WHERE requestDate = ?",
      [formattedToday]
    );
    const result = (rows as { requestCount: number }[]) || null;

    let sql = "";
    let values;

    if (result.length > 0) {
      // 해당 날짜의 요청 기록이 이미 존재할 경우 요청 카운트를 증가
      sql =
        "UPDATE request_counts SET requestCount = requestCount + 1 WHERE requestDate = ?";
      values = [formattedToday];
    } else {
      // 해당 날짜의 요청 기록이 없을 경우 새로운 레코드 추가
      sql =
        "INSERT INTO request_counts (requestDate, requestCount) VALUES (?, ?)";
      values = [formattedToday, 1];
    }

    await req.poolConnection.query(sql, values);

    res.status(200).json({ message: "API 요청 횟수 업데이트 성공" });
  } catch (error) {
    next(error);
  }
});

export default router;
