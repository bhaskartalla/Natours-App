import type { Request, Response, NextFunction } from 'express'
import { catchAsync } from '../utils/catchAsync'
import Review, { type IReview } from '../models/reviewModel'
import { createOne, deleteOne, updateOne } from './handlerFactory'

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

export const setTourUserIds = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user?.id
  next()
}

export const createReview = createOne<IReview>(Review)

export const updateReview = updateOne<IReview>(Review)

export const deleteReview = deleteOne<IReview>(Review)
