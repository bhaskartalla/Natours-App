import type { Request, Response, NextFunction } from 'express'
import { catchAsync } from '../utils/catchAsync'
import AppError from '../utils/appError'
import { Model, Document } from 'mongoose'

export const deleteOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.findByIdAndDelete(req.params.id)

    if (!document)
      return next(new AppError('No document found with that ID', 404))

    res.status(204).json({
      status: 'success',
      data: null,
    })
  })

export const updateOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!document)
      return next(new AppError('No document found with that ID', 404))

    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    })
  })

export const createOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    })
  })
