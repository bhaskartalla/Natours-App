import mongoose, { Document, Model } from 'mongoose'

export interface IReview extends Document {
  review: string
  rating: number
  createdAt: Date
  tour: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
}

export interface IReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: mongoose.Types.ObjectId): Promise<void>
}
