import multer, { type FileFilterCallback } from 'multer'
import type { NextFunction, Request, Response } from 'express'
import { catchAsync } from '../utils/catchAsync'
import User, { type IUser } from '../models/userModel'
import AppError from '../utils/appError'
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory'

export const updateUser = updateOne<IUser>(User)

const multerStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, 'public/img/users')
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) {
    const ext = file.mimetype.split('/')[1]
    const fileName = `user-${req.user?.id}-${Date.now()}.${ext}`
    cb(null, fileName)
  },
})

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(
      new AppError(
        'Not an image! Please upload only images.',
        400,
      ) as unknown as Error,
    )
  }
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

export const updateUserPhoto = upload.single('photo')

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

export const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!. Please use /signup instead',
  })
}

export const getAllUsers = getAll<IUser>(User)

export const getUser = getOne<IUser>(User)

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user?.id ?? ''
  next()
}

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('🚀 ~ req:', { file: req.file })
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

export const deleteUser = deleteOne<IUser>(User)

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user?.id, { active: false })

    res.status(204).json({
      status: 'success',
      data: null,
    })
  },
)
