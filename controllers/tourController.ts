import type { Request, Response, NextFunction } from 'express'
import Tour, { type ITour } from '../models/tourModel'
import APIFeatures from '../utils/apiFeatures'
import { catchAsync } from '../utils/catchAsync'
import AppError from '../utils/appError'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory'

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  ;(req as any).aliasQuery = {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  }

  next()
}

export const createTour = createOne<ITour>(Tour)

export const getTour = getOne<ITour>(Tour, { path: 'reviews' })

export const getAllTours = getAll<ITour>(Tour)

export const updateTour = updateOne<ITour>(Tour)

export const deleteTour = deleteOne<ITour>(Tour)

export const getTourStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ])

    res.status(200).json({
      status: 'success',
      data: stats,
    })
  },
)

export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = Number(req.params.year)

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ])

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    })
  },
)
