import { type Request, type Response, type NextFunction } from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import helmet from 'helmet'
import cors from 'cors'

export const setSecurityHeaders = helmet()

export const setCors = cors()

export const setCorsOptions = cors()

export const sanitizeMongo = [
  (req: Request, res: Response, next: NextFunction) => {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    })
    next()
  },
  mongoSanitize(),
]

export const sanitizeXss = xss()

export const preventParamPollution = hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price',
  ],
})
