import type { Request, Response, NextFunction } from 'express'
import express from 'express'
import morgan from 'morgan'

import { router as tourRouter } from './routes/tourRoutes'
import { router as userRouter } from './routes/userRoutes'
import AppError from './utils/appError'
import { globalErrorHandler } from './controllers/errorController'

const app = express()

// if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev'))
// }

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
