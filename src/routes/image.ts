import { Router } from "express";
import { createCanvas, registerFont } from "canvas";
import path from "path";

const router = Router();

function isValidHexColor(color: string) {
  return /^([0-9A-F]{6})$/i.test(color);
}

router.get("/:size?/:bgColor?/:textWithExt?/:textColor?", (req, res, next) => {
  try {
    const {
      size = "150x150",
      bgColor = "CCCCCC",
      textWithExt = "",
      textColor = "000000"
    } = req.params;

    // textWithExt에서 텍스트와 확장자 분리
    const [text = "", ext = "png"] = textWithExt.split(".");

    // 지원되는 포맷 체크
    const supportedFormats = ["png", "jpeg", "jpg", "svg"];
    if (!supportedFormats.includes(ext)) {
      res.status(400).json({ message: "Unsupported file format" });
    }

    // 이미지 최대 크기
    const MAX_WIDTH = 2560;
    const MAX_HEIGHT = 2560;

    // size에서 가로와 세로 값 추출
    const [widthStr, heightStr] = size.split("x");
    let width = parseInt(widthStr, 10);
    let height = heightStr ? parseInt(heightStr, 10) : width;

    // 최대 크기 제한 적용
    width = Math.min(width, MAX_WIDTH);
    height = Math.min(height, MAX_HEIGHT);

    // 색상 유효성 검사
    const backgroundColor = isValidHexColor(bgColor)
      ? `#${bgColor}`
      : "#CCCCCC";
    const fontColor = isValidHexColor(textColor) ? `#${textColor}` : "#000000";

    // 텍스트 처리: 텍스트가 없으면 width x height로 기본값 설정
    const displayText = text
      ? text.replace(/\+/g, " ")
      : `${width} x ${height}`;

    const textLength = displayText.length;
    const fontSize = Math.min(width, height) / (textLength > 10 ? 15 : 10);

    // 폰트 등록
    registerFont(
      path.join(process.cwd(), "public/fonts/NotoSansKR-Regular.ttf"),
      {
        family: "Noto Sans KR"
      }
    );

    let buffer: Buffer | string;
    let contentType: string;

    if (ext === "svg") {
      buffer = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="${backgroundColor}" />
        <text x="50%" y="50%" font-size="${fontSize}" fill="${fontColor}" text-anchor="middle" dominant-baseline="middle" font-family="Noto Sans KR">
          ${displayText}
        </text>
      </svg>`;
      contentType = "image/svg+xml";
    } else {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // 배경색 그리기
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // 텍스트 그리기
      ctx.fillStyle = fontColor;
      ctx.font = `${fontSize}px "Noto Sans KR"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayText, width / 2, height / 2);

      // 이미지 포맷에 따른 버퍼 생성
      buffer =
        ext === "png"
          ? canvas.toBuffer("image/png")
          : canvas.toBuffer("image/jpeg");

      contentType = ext === "png" ? "image/png" : "image/jpeg";
    }

    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

export default router;
