import type { NextFunction, Request, Response } from 'express'
import { catchAsync } from '../utils/catchAsync'
import User from '../models/userModel'
import AppError from '../utils/appError'

const filterObj = (
  body: Record<string, any>,
  ...allowedFields: string[]
): Record<string, any> => {
  const newObj: Record<string, any> = {}
  Object.keys(body).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = body[key]
  })

  return newObj
}

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find()

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: users.length,
      data: { users },
    })
  },
)

export const getUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  })
}
export const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  })
}
export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Create error if user POSTs password data

    if (req.body.password || req.body.passwordConfirm)
      return next(
        new AppError(
          'This route is not for password updates. Please use /update-password.',
          400,
        ),
      )

    // Filtered out unwanted fields names that are not allowed to be updated
    const filteredObj = filterObj(req.body, 'name', 'email')

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      filteredObj,
      {
        new: true,
        runValidators: true,
      },
    )

    // Update user document
    res.status(500).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    })
  },
)

export const deleteUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  })
}
