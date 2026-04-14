import mongoose, { Query, Document, Aggregate } from 'mongoose'

export interface ILocation {
  type: 'Point'
  coordinates: number[]
  address: string
  description: string
}

export interface ITourLocation extends ILocation {
  day: number
}

export interface ITour extends Document {
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
  guides: mongoose.Types.ObjectId[]
}
