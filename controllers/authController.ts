import { catchAsync } from '../utils/catchAsync'
import type { Request, Response, NextFunction } from 'express'
import User, { type IUser } from '../models/userModel'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import AppError from '../utils/appError'
import { sendEmail } from '../utils/email'
import crypto from 'crypto'

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '10m',
  })
}

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString())

  const cookieOptions: Record<any, any> = {
    expires: new Date(
      Date.now() +
        1000 * 60 * 60 * 24 * Number(process.env.JWT_COOKIE_EXPIRES_IN),
    ),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === 'development') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  user.password = undefined

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
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
    createSendToken(newUser, 201, res)
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
    if (!user || !(await user.correctPassword(password, user.password ?? '')))
      return next(new AppError('Incorrect email or password', 401))

    // 3. If everything is ok, then send token to client
    createSendToken(user, 200, res)
  },
)

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() * 3 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    status: 'success',
  })
}
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
    if (!user)
      return next(
        new AppError(`No user found with email ${req.body.email}`, 404),
      )

    // Generate random reset token
    const resetToken = user.createPaswordResetToken()
    await user.save({ validateBeforeSave: false })

    // Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/reset-password/${resetToken}`
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`
    try {
      await sendEmail({
        to: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      })

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      })
    } catch (error) {
      user.passwordResetToken = undefined
      user.passwordResetExpire = undefined
      await user.save({ validateBeforeSave: false })

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500,
        ),
      )
    }
  },
)

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get user based on the token
    const hashToken = crypto
      .createHash('sha256')
      .update((req.params.token as string) ?? '')
      .digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashToken,
      passwordResetExpire: { $gt: Date.now().toString() },
    })

    if (!user) return next(new AppError('Token is invalid or has expired', 400))

    // If token has not expired, and there is user, set the new password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpire = undefined

    await user.save()

    // Update changedPasswordAt property for the user(this is happening at user model)

    // Log the user in, send JWT
    createSendToken(user, 200, res)
  },
)

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get user from collection
    const user = await User.findById(req.user?.id ?? '').select('+password')

    // Check if POSTed current password is correct
    if (
      !user ||
      !(await user?.correctPassword(
        req.body.passwordCurrent,
        user.password ?? '',
      ))
    )
      return next(new AppError('Your current password is wrong.', 401))

    // If so, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm

    await user.save()

    // Log user in, send JWT
    createSendToken(user, 200, res)
  },
)
