import type { Request, Response, NextFunction } from 'express'
import Review, { type IReview } from '../models/reviewModel'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory'

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
