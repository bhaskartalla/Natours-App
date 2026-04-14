import mongoose, { Model } from 'mongoose'
import Tour from '@modules/tour/tour.model'
import { IReview } from './review.types'

interface IReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: mongoose.Types.ObjectId): Promise<void>
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.statics.calcAverageRatings = async function (
  tourId: mongoose.Types.ObjectId,
) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ])

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    })
  }
}

reviewSchema.post('save', async function () {
  ;(this.constructor as IReviewModel).calcAverageRatings(
    this.tour as mongoose.Types.ObjectId,
  )
})

reviewSchema.pre(/^findOneAnd/, async function (this) {
  this.r = await this.clone().findOne()
})

reviewSchema.post(/^findOneAnd/, async function (this) {
  if (this.r) {
    await (this.model as IReviewModel).calcAverageRatings(this.r.tour)
  }
})

reviewSchema.pre(/^find/, async function (this) {
  this.populate({
    path: 'user',
    select: 'name photo',
  })
})

export default mongoose.model<IReview, IReviewModel>('Review', reviewSchema)
