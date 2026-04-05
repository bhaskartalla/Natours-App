import express from 'express'
import {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourUserIds,
} from '../controllers/reviewController'
import { protect, restrictTo } from '../controllers/authController'

const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview)

router.route('/:id').patch(protect, updateReview).delete(protect, deleteReview)

export { router }
