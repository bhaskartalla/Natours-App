import mongoose, {
  type CallbackWithoutResultAndOptionalError,
  Document,
  type HydratedDocument,
  Query,
} from 'mongoose'
import slugify from 'slugify'

export interface ITour {
  name: string
  slug: string
  duration: number
  maxGroupSize: number
  difficulty: 'easy' | 'medium' | 'difficult'
  ratingsAverage: number
  ratingsQuantity: number
  price: number
  priceDiscount?: number
  summary: string
  description?: string
  imageCover: string
  images: string[]
  createdAt: Date
  startDates: Date[]
}

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour must have maximum of 40 characters'],
      minlength: [10, 'A tour must have minimum of 10 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a group difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val: number) {
          return val < this.price
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a cover image'],
    },
    images: {
      type: [String],
    },
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: {
      type: [Date],
    },
    slug: {
      type: String,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

tourSchema.virtual('durationWeeks').get(function (this: ITour) {
  return this.duration / 7
})

tourSchema.pre('save', async function () {
  this.slug = slugify(this.name, { lower: true })
})

tourSchema.pre(/^find/, async function (this: Query<any, any>) {
  // this.start = Date.now()
  this.find({ secretTour: { $ne: true } })
})

// tourSchema.post(/^find/, function (docs) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`)
// })

tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
})

export default mongoose.model('Tour', tourSchema)
