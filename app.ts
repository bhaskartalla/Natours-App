import type { Request, Response, NextFunction } from 'express'
import express from 'express'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import hpp from 'hpp'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'

import { router as tourRouter } from './routes/tourRoutes'
import { router as userRouter } from './routes/userRoutes'
import { router as reviewRouter } from './routes/reviewRoutes'
import AppError from './utils/appError'
import { globalErrorHandler } from './controllers/errorController'

const app = express()

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet())

// Development logging
// if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev'))
// }

// Limit requests from same API
const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
})
app.use('/api', limit)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }))

// Data sanitization against NoSQL query injection
app.use((req: Request, res: Response, next: NextFunction) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  })
  next()
})
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
)

// Serving static files
app.use(express.static(`${__dirname}/public`))

// Test middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString()
  next()
})

// ROUTES
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*splat', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})
// Global error handling
app.use(globalErrorHandler)

export default app
