import mongoose, { Query, Document, Aggregate } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  photo: string
  password: string
  passwordConfirm: string | undefined
  passwordChangedAt: Date
  role: 'admin' | 'lead-guide' | 'guide' | 'user'
  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>
  changedPasswordAt(jwtTimeStamp: number): boolean
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
})

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
})

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAt = function (jwtTimeStamp: number) {
  if (this.passwordChangedAt) {
    const changeTimeStamp =
      parseInt(this.passwordChangedAt.getTime(), 10) / 1000

    return jwtTimeStamp < changeTimeStamp
  }

  return false
}

export default mongoose.model('User', userSchema)
