import express from 'express'
import {
  getMonthlyPlan,
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
} from './../controllers/tourController'
import { protect, restrictTo } from '../controllers/authController'
import { router as reviewRouter } from './reviewRoutes'

const router = express.Router()

router.use('/:tourId/reviews', reviewRouter)

router.route('/top-5-cheap').get(aliasTopTours, getAllTours)

router.route('/tour-stats').get(getTourStats)

router.route('/monthly-plan/:year').get(getMonthlyPlan)

router.route('/').get(protect, getAllTours).post(createTour)

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

export { router }
