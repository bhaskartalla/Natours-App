import Stripe from 'stripe'
import { catchAsync } from '../utils/catchAsync'
import type { Request, Response, NextFunction } from 'express'
import Tour from '../models/tourModel'

export const getCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)

    // 2) Create checkout session
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: 'https://stickky-note-app.web.app/',
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
