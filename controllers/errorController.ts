import type { Request, Response, NextFunction } from 'express'
import AppError from '../utils/appError'
import { MongoServerError } from 'mongodb'
import { Error as MongooseError } from 'mongoose'

const sendErrorDevelopment = (err: AppError, res: Response) => {
  return res.status(404).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProduction = (err: AppError, res: Response) => {
  if (err.isOperational) {
    return res.status(404).json({
      status: err.status,
      message: err.message,
    })
  } else {
    // console.log('💥 Error ', err)
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    })
  }
}

const handleCastErrorDB = (err: MongooseError.CastError) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err: MongoServerError) => {
  const match = err.errmsg.match(/(["'])(\\?.)*?\1/)
  const value = match ? match[0] : 'unknown'

  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}

const handleValidationErrorDB = (err: MongooseError.ValidationError) => {
  const errors = Object.values(err.errors).map((el) => el.message)

  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

export const globalErrorHandler = (
  err:
    | AppError
    | MongooseError.CastError
    | MongooseError.ValidationError
    | MongoServerError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = { ...err, message: err.message, name: err.name } as AppError

  error.statusCode = error.statusCode || 500
  error.status = error.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(error, res)
  } else if (process.env.NODE_ENV === 'production') {
    if (err instanceof MongooseError.CastError) {
      error = handleCastErrorDB(err)
    } else if (err instanceof MongoServerError && err.code === 11000) {
      error = handleDuplicateFieldsDB(err)
    } else if (err instanceof MongooseError.ValidationError) {
      error = handleValidationErrorDB(err)
    }
    sendErrorProduction(error, res)
  }
}
