import type { Request, Response, NextFunction } from 'express'
import Tour from '../models/tourModel'
import type { Query } from 'mongoose'
import APIFeatures from '../utils/apiFeatures'

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

export const getAllTours = async (req: Request, res: Response) => {
  try {
    const features = new APIFeatures(Tour.find(), req)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const tours = await features.query

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: { tours },
    })
  } catch (error) {
    const err = error as Error
    console.log('🚀 ~ getAllTours ~ error:', err?.message)

    res.status(400).json({
      status: 'fail',
      message: error,
    })
  }
}

export const getTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findById(req.params.id)
    res.status(200).json({
      status: 'success',
      data: { tour },
    })
  } catch (error) {
    const err = error as Error
    console.log('🚀 ~ getTour ~ error:', err?.message)

    res.status(400).json({
      status: 'fail',
      message: error,
    })
  }
}

export const createTour = async (req: Request, res: Response) => {
  try {
    const newTour = await Tour.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    })
  } catch (error) {
    const err = error as Error
    console.log('🚀 ~ createTour ~ error:', err?.message)

    res.status(400).json({
      status: 'fail',
      message: error,
    })
  }
}

export const updateTour = async (req: Request, res: Response) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    })
  } catch (error) {
    const err = error as Error
    console.log('🚀 ~ updateTour ~ error:', err?.message)

    res.status(400).json({
      status: 'fail',
      message: error,
    })
  }
}

export const deleteTour = async (req: Request, res: Response) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
      status: 'success',
      data: null,
    })
  } catch (error) {
    const err = error as Error
    console.log('🚀 ~ deleteTour ~ error:', err?.message)

    res.status(400).json({
      status: 'fail',
      message: error,
    })
  }
}

export const getTourStats = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    const err = error as Error
    console.log('🚀 ~ getTourStats ~ error:', err?.message)

    res.status(400).json({
      status: 'fail',
      message: error,
    })
  }
}

export const getMonthlyPlan = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    const err = error as Error
    console.log('🚀 ~ getMonthlyPlan ~ error:', err?.message)

    res.status(400).json({
      status: 'fail',
      message: error,
    })
  }
}
