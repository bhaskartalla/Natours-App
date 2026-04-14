import type { Request, Response, NextFunction } from 'express'
import Review from '@modules/review/review.model'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from '@shared/factory/handlerFactory'
import { IReview } from '@modules/review/review.types'

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

export const getReview = getOne<IReview>(Review)

export const getAllReviews = getAll<IReview>(Review)

export const updateReview = updateOne<IReview>(Review)

export const deleteReview = deleteOne<IReview>(Review)
