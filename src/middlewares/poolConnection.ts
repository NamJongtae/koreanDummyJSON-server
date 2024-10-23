import { Request, Response, NextFunction } from "express";
import pool from "../db";

 const poolConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const connection = await pool.getConnection();
    req.poolConnection = connection;

    res.on("finish", () => {
      if (req.poolConnection) req.poolConnection.release();
    });

    next();
  } catch (error: any) {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
  }
  if (error.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
  }
  if (error.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
  }
    next(error);
  }
};

export default poolConnection;
