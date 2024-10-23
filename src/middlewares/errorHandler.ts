import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const statusCode = error.status || 500; 

  console.error(`
    Error occurred:
    - Status: ${statusCode}
    - Message: ${error.message}
    - Request: ${request.method} ${request.url}
    - Stack: ${error.stack}
  `);

  response
    .status(statusCode)
    .json({
      status: statusCode,
      message:
        statusCode === 500
          ? "서버 에러가 발생하였습니다. 잠시 후 다시 시도해주세요."
          : error.message
    });
};

export default errorHandler;
