import type { Request, Response, NextFunction } from 'express'
import { catchAsync } from '../utils/catchAsync'
import AppError from '../utils/appError'
import { Model, Document, type PopulateOptions } from 'mongoose'
import APIFeatures from '../utils/apiFeatures'

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

export const getOne = <T extends Document>(
  Model: Model<T>,
  populateOptions?: PopulateOptions,
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = Model.findById(req.params.id)
    if (populateOptions) query?.populate(populateOptions)
    const document = await query

    if (!document)
      return next(new AppError('No document found with that ID', 404))

    res.status(200).json({
      status: 'success',
      data: { data: document },
    })
  })

export const getAll = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const features = new APIFeatures(Model.find(filter), req)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const documents = await features.query

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: documents.length,
      data: { data: documents },
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
