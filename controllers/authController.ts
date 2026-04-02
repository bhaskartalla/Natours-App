import { catchAsync } from '../utils/catchAsync'
import type { Request, Response, NextFunction } from 'express'
import User from '../models/userModel'

export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newuser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    })

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { user: newuser },
    })
  },
)
