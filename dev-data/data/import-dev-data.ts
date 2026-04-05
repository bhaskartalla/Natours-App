import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fs from 'fs'
import Tour from '../../models/tourModel'
import User from '../../models/userModel'
import Review from '../../models/reviewModel'

dotenv.config({ path: `${__dirname}/../../config.env` })

const DB =
  process.env.IS_LOCAL_DB === 'true'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE?.replace(
        '<PASSWORD>',
        process.env.DATABASE_PASSWORD ?? '',
      )

mongoose
  .connect(DB as string)
  .then(() => console.log('🖲️ ~ Databse connected successfully:', DB))

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
)

const importData = async () => {
  try {
    await Tour.create(tours)
    console.log('🚀 ~ Tour data loaded properly')
    await User.create(users)
    console.log('🚀 ~ User data loaded properly')
    await Review.create(reviews)
    console.log('🚀 ~ Review data loaded properly')
  } catch (error) {
    console.log('🚀 ~ importData ~ error:', error)
  } finally {
    process.exit()
  }
}

const deleteAllData = async () => {
  try {
    await Tour.deleteMany()
    console.log('🚀 ~ Tour data deleted properly')
    await User.deleteMany()
    console.log('🚀 ~ User data deleted properly')
    await Review.deleteMany()
    console.log('🚀 ~ Review data deleted properly')
  } catch (error) {
    console.log('🚀 ~ deleteAllData ~ error:', error)
  } finally {
    process.exit()
  }
}

if (process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] === '--delete') {
  deleteAllData()
}
