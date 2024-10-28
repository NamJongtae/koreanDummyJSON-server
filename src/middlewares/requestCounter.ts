import { Request, Response, NextFunction } from "express";

const requestCounter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path !== "/" && req.path !== "/request-count") {
    const clientIp = req.ip || req.header("x-forwarded-for")?.split(",")[0];
    console.log(clientIp);

    try {
      await fetch(`${process.env.BASE_URL}/request-count`, {
        method: "POST"
      });
    } catch (error) {
      next(error);
    }
  }
  next();
};

export default requestCounter;
