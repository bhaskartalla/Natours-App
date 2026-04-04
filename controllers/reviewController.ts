import type { Request, Response, NextFunction } from 'express'
import { catchAsync } from '../utils/catchAsync'
import Review from '../models/reviewModel'

export const getAllReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await Review.find()

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    })
  },
)

export const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = await Review.create(req.body)

    res.status(201).json({
      status: 'success',
      data: { review },
    })
  },
)
