import Stripe from 'stripe'
import { catchAsync } from '../utils/catchAsync'
import type { Request, Response, NextFunction } from 'express'
import Tour from '../models/tourModel'
import Booking from '../models/bookingModel'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory'

export const getCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)

    // 2) Create checkout session
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
        req.params.tourId
      }&user=${req.user?.id}&price=${tour.price}`,
      cancel_url: 'https://stickky-note-app.web.app/profile',
      customer_email: req.user?.email ?? '',
      client_reference_id: tour.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: (tour?.price ?? 0) * 100,
            product_data: {
              name: `${tour?.name} Tour`,
              description: tour?.summary,
              images: [`https://www.natours.dev/img/tours/${tour?.imageCover}`],
            },
          },
        },
      ],
      mode: 'payment',
    })

    // 3) Create session as response
    res.status(200).json({
      status: 'success',
      session,
    })
  },
)

export const createBookingCheckout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
    const { tour, user, price } = req.query

    if (!tour || !user || !price) return next()

    await Booking.create({
      tour: tour as string,
      user: user as string,
      price: Number(price),
    })

    res.redirect(req.originalUrl.split('?')[0] ?? '')
  },
)

export const createBooking = createOne(Booking)
export const getBooking = getOne(Booking)
export const getAllBookings = getAll(Booking)
export const updateBooking = updateOne(Booking)
export const deleteBooking = deleteOne(Booking)
