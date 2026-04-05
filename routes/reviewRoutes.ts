import express from 'express'
import {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} from '../controllers/reviewController'
import { protect, restrictTo } from '../controllers/authController'

const router = express.Router({ mergeParams: true })

// Protect all routes after this middleware
router.use(protect)

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview)

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview)

export { router }
