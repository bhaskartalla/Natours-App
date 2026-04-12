import Stripe from 'stripe'
import { catchAsync } from '../utils/catchAsync'
import type { Request, Response, NextFunction } from 'express'
import Tour from '../models/tourModel'
import User from '../models/userModel'
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
      success_url: 'https://stickky-note-app.web.app',
      cancel_url: 'https://stickky-note-app.web.app/profile',
      customer_email: req.user?.email ?? '',
      client_reference_id: tour.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'rsd',
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

const createBookingCheckout = async (session: any) => {
  const tourId = session.client_reference_id
  const userId = (await User.findOne({ email: session.customer_email })).id
  const price = session.amount_total / 100
  await Booking.create({ tour: tourId, user: userId, price })
}

export const webhookCheckout = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
  const signature = req.headers['stripe-signature'] ?? ''
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    )
  } catch (error) {
    const err = error as Error
    return res.status(400).send(`Webhook error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object)

  res.status(200).json({ received: true })
}

export const createBooking = createOne(Booking)
export const getBooking = getOne(Booking)
export const getAllBookings = getAll(Booking)
export const updateBooking = updateOne(Booking)
export const deleteBooking = deleteOne(Booking)
