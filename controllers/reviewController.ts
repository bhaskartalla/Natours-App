import type { Request, Response, NextFunction } from 'express'
import { catchAsync } from '../utils/catchAsync'
import Review from '../models/reviewModel'

export const getAllReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const reviews = await Review.find(filter)

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    })
  },
)

export const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user?.id

    const review = await Review.create(req.body)

    res.status(201).json({
      status: 'success',
      data: { review },
    })
  },
)
