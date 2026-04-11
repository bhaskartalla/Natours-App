import express from 'express'

import { protect, restrictTo } from '../controllers/authController'
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBooking,
  getCheckoutSession,
  updateBooking,
} from '../controllers/bookingController'

const router = express.Router()

router.use(protect)

router.route('/checkout-session/:tourId').get(protect, getCheckoutSession)

router.use(restrictTo('admin', 'lead-guide'))

router.route('/').get(getAllBookings).post(createBooking)

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking)

export { router }
