import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import CustomError from "../lib/customError";

const router = Router();

router.post("/login", (req, res, next) => {
  try {
    const { id, password, ATExp, RTExp } = req.body;
    if (!id.trim()) {
      res.status(422).json({ message: "id를 입력해주세요." });
      return;
    }

    if (!password.trim()) {
      res.status(422).json({ message: "password를 입력해주세요." });
      return;
    }

    const accessToken = jwt.sign({ id }, "ACCESS_TOKEN", {
      expiresIn: ATExp || 60 * 60
    });

    const refreshToekn = jwt.sign({ id }, "REFRESH_TOKEN", {
      expiresIn: RTExp || 60 * 60 * 24
    });

    res.json({
      message: "로그인 성공",
      accessToken,
      refreshToekn
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "jwt malformed" ||
        error.message === "invalid token"
      ) {
        next(new CustomError("유효하지 않은 토큰입니다.", 401));
      } else if (error.message === "jwt expired") {
        next(new CustomError("만료된 토큰입니다.", 401));
      } else {
        next(new CustomError(error.message, 500));
      }
    }
  }
});

router.get("/refresh", (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "토큰이 존재하지 않습니다." });
      return;
    }

    const refreshToken = authHeader.split(" ")[1];

    const decoded = jwt.verify(refreshToken, "REFRESH_TOKEN") as JwtPayload;

    const newAccessToken = jwt.sign({ id: decoded.id }, "ACCESS_TOKEN", {
      expiresIn: decoded.exp || 30 * 60
    });

    res.json({
      message: "accessToken 재발급 성공",
      accessToken: newAccessToken
    });
    return;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "jwt malformed" ||
        error.message === "invalid token"
      ) {
        next(new CustomError("유효하지 않은 토큰입니다.", 401));
      } else if (error.message === "jwt expired") {
        next(new CustomError("만료된 토큰입니다.", 401));
      } else {
        next(new CustomError(error.message, 500));
      }
    }
  }
});

router.get("/user", (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "토큰이 존재하지 않습니다." });
      return;
    }

    const accessToken = authHeader.split(" ")[1];

    const decoded = jwt.verify(accessToken, "ACCESS_TOKEN") as JwtPayload;

    res.status(200).json({
      message: "토큰 인증 성공",
      userId: decoded.id
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "jwt malformed" ||
        error.message === "invalid token"
      ) {
        next(new CustomError("유효하지 않은 토큰입니다.", 401));
      } else if (error.message === "jwt expired") {
        next(new CustomError("만료된 토큰입니다.", 401));
      } else {
        next(new CustomError(error.message, 500));
      }
    }
  }
});

export default router;
