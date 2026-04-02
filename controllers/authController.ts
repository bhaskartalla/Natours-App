import { catchAsync } from '../utils/catchAsync'
import type { Request, Response, NextFunction } from 'express'
import User from '../models/userModel'
import jwt from 'jsonwebtoken'
import AppError from '../utils/appError'

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '10m',
  })
}

export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    })

    const token = signToken(newUser._id.toString())

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    })
  },
)

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    // 1. Check email and password exist
    if (!email || !password)
      return next(new AppError('Please provide email and password!', 400))

    // 2. Check if theuser exists and password is correct
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401))
    }

    // 3. If everything is ok, then send token to client
    const token = signToken(user._id.toString())

    res.status(200).json({
      status: 'success',
      token,
    })
  },
)
