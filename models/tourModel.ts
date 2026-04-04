import mongoose, { Query, Document, Aggregate } from 'mongoose'
import slugify from 'slugify'

interface ILocation {
  type: 'Point'
  coordinates: number[]
  address: string
  description: string
}

interface ITourLocation extends ILocation {
  day: number
}

interface ITour extends Document {
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
  secretTour: boolean
  startLocation: ILocation
  locations: ITourLocation[]
  guides: String
}

const tourSchema = new mongoose.Schema<ITour>(
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
        validator: function (this: ITour, val: number) {
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
    createdAt: {
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
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
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
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  })
})

tourSchema.pre(/^find/, async function (this: Query<any, any>) {
  this.find({ secretTour: { $ne: true } })
})

tourSchema.pre('aggregate', function (this: Aggregate<any>) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
})

export default mongoose.model<ITour>('Tour', tourSchema)
