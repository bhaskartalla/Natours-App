import mongoose, { Query, Document, Aggregate } from 'mongoose'
import validator from 'validator'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  id: string
  name: string
  email: string
  photo: string
  password: string | undefined
  passwordConfirm: string | undefined
  passwordChangedAt: Number
  passwordResetToken: string | undefined
  passwordResetExpire: string | undefined
  active: boolean

  role: 'admin' | 'lead-guide' | 'guide' | 'user'
  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>
  changedPasswordAt(jwtTimeStamp: number): boolean
  createPaswordResetToken(): string
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (this: IUser, val: string) {
        return this.password === val
      },
      message: 'Passwors are not the same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpire: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
})

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password ?? '', 12)
  this.passwordConfirm = undefined
})

userSchema.pre('save', async function () {
  if (!this.isModified('password') || this.isNew) return
  this.passwordChangedAt = Date.now() - 1000
})

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.pre(/^find/, function (this: Query<any, any>) {
  this.find({ active: true })
})

userSchema.methods.changedPasswordAt = function (jwtTimeStamp: number) {
  if (this.passwordChangedAt) {
    const changeTimeStamp =
      parseInt(this.passwordChangedAt.getTime(), 10) / 1000

    return jwtTimeStamp < changeTimeStamp
  }

  return false
}

userSchema.methods.createPaswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000
  return resetToken
}

export default mongoose.model('User', userSchema)
