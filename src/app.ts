import type { Request, Response, NextFunction } from 'express'
import express from 'express'
import compression from 'compression'
import morgan from 'morgan'

import { apiRateLimiter } from '@shared/middleware/rateLimiter'
import {
  setSecurityHeaders,
  setCors,
  sanitizeMongo,
  sanitizeXss,
  preventParamPollution,
} from '@shared/middleware/sanitization'

import { webhookCheckout } from '@modules/booking/booking.controller'

import AppError from '@shared/utils/appError'
import { globalErrorHandler } from '@shared/middleware/errorHandler'

import { router as authRouter } from '@modules/auth/auth.routes'
import { router as tourRouter } from '@modules/tour/tour.routes'
import { router as userRouter } from '@modules/user/user.routes'
import { router as reviewRouter } from '@modules/review/review.routes'
import { router as bookingRouter } from '@modules/booking/booking.routes'

const app = express()

// 1) GLOBAL MIDDLEWARES

// Enable CORS
app.use(setCors)
app.options('/{*splat}', setCors)

// Security headers
app.use(setSecurityHeaders)

// Logging
app.use(morgan('dev'))

// Trust proxy (important for rate limiting, IPs)
app.set('trust proxy', 1)

// Rate limiting
app.use('/api', apiRateLimiter)

// Stripe webhook (must be before body parser)
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout,
)

// Body parser
app.use(express.json({ limit: '10kb' }))

// Data sanitization (centralized)
app.use(sanitizeMongo)
app.use(sanitizeXss)

// Prevent parameter pollution
app.use(preventParamPollution)

// Static files
app.use(express.static('public'))

// Compression
app.use(compression())

// Custom middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString()
  next()
})

// 2) ROUTES

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

// 3) 404 Handler
app.all('/{*splat}', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

// 4) Global Error Handler
app.use(globalErrorHandler)

export default app
