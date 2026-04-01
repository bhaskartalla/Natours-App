import type { Request, Response, NextFunction } from 'express'
import type AppError from '../utils/appError'

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  res.status(404).json({
    status: err.status,
    message: err.message,
  })
}
