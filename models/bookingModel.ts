import mongoose, { Document } from 'mongoose'

export interface IBooking extends Document {
  tour: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  createdAt: Date
  price: number
  paid: boolean
}

const bookingSchema = new mongoose.Schema<IBooking>({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
})

bookingSchema.pre(/^find/, async function (this) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  })
})

export default mongoose.model<IBooking>('Booking', bookingSchema)
