import express from 'express'

import { protect, restrictTo } from '../controllers/authController'
import { getCheckoutSession } from '../controllers/bookingController'

const router = express.Router()

router.route('/checkout-session/:tourId').get(protect, getCheckoutSession)

export { router }
