import { Document } from 'mongoose'

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
