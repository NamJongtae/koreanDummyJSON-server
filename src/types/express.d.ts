import { PoolConnection } from 'mysql2/promise';

declare global {
  namespace Express {
    interface Request {
      poolConnection?: PoolConnection;
    }
  }
}