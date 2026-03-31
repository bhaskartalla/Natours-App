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
    console.log('🚀 ~ createTour ~ error:', err?.message)

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
    console.log('🚀 ~ createTour ~ error:', err?.message)

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
    console.log('🚀 ~ createTour ~ error:', err?.message)

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
    console.log('🚀 ~ createTour ~ error:', err?.message)

    res.status(400).json({
      status: 'fail',
      message: error,
    })
  }
}
