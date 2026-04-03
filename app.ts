import type { Request, Response, NextFunction } from 'express'
import express from 'express'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { router as tourRouter } from './routes/tourRoutes'
import { router as userRouter } from './routes/userRoutes'
import AppError from './utils/appError'
import { globalErrorHandler } from './controllers/errorController'

const app = express()

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

const limit = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
})
app.use('/api', limit)

app.use(express.json())
app.use(express.static(`${__dirname}/public`))

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString()
  next()
})

// 3) ROUTES
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*splat', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)

export default app
