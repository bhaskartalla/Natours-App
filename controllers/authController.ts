import { catchAsync } from '../utils/catchAsync'
import type { Request, Response, NextFunction } from 'express'
import User from '../models/userModel'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
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
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
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
    if (!user || !(await user.correctPassword(password, user.password)))
      return next(new AppError('Incorrect email or password', 401))

    // 3. If everything is ok, then send token to client
    const token = signToken(user._id.toString())

    res.status(200).json({
      status: 'success',
      token,
    })
  },
)

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1 Get the token and check if it's there
    let token = ''

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1] ?? ''
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in! Please log in to get access.',
          401,
        ),
      )
    }

    // 2 Verification of token
    const verifyToken = promisify<
      string,
      string,
      jwt.VerifyOptions,
      jwt.JwtPayload
    >(jwt.verify)

    const decoded = await verifyToken(
      token,
      process.env.JWT_SECRET as string,
      {},
    )

    // Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser)
      return next(
        new AppError('This user belonging to this token does not exist', 401),
      )

    // 4 Check if user changed password after the token was issued
    if (currentUser.changedPasswordAt(Number(decoded.iat))) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401,
        ),
      )
    }

    // Grant acces to protected route
    req.user = currentUser
    next()
  },
)

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      )
    }
    next()
  }
}

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get user based on the posted email
    const user = await User.findOne({ email: req.body.email })
    console.log('🚀 ~ user:', user)
    if (!user)
      return next(
        new AppError(`No user found with email ${req.body.email}`, 404),
      )

    // Generate random reset token
    const resetToken = user.createPaswordResetToken()
    await user.save({ validateBeforeSave: false })

    next()
  },
)
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    next()
  },
)
