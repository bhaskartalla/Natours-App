import mongoose, { Document } from 'mongoose'

export interface IBooking extends Document {
  tour: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  createdAt: Date
  price: number
  paid: boolean
}
