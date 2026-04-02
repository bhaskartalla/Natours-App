import mongoose, { Query, Document, Aggregate } from 'mongoose'
import validator from 'validator'
import bcryptjs from 'bcryptjs'

interface IUser extends Document {
  name: string
  email: string
  photo: string
  password: string
  passwordConfirm: string | undefined
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
})

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcryptjs.hash(this.password, 12)
  this.passwordConfirm = undefined
})

export default mongoose.model('User', userSchema)
