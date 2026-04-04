import express from 'express'
import { createReview, getAllReviews } from '../controllers/reviewController'
import { protect, restrictTo } from '../controllers/authController'

const router = express.Router()

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview)

export { router }
