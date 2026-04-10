import nodemailer, { type TransportOptions } from 'nodemailer'
import type { IUser } from '../models/userModel'
import { convert } from 'html-to-text'
import pug from 'pug'

type EmailOptions = {
  to: string
  subject: string
  message: string
}

class Email {
  to: string
  firstName: string
  url: string
  from: string

  constructor(user: IUser, url: string) {
    this.to = user.email
    this.firstName = user.name.split(' ')[0] ?? ''
    this.url = url
    this.from = `Bhaskar Talla ${process.env.EMAIL_FROM}`
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      })
    }

    // 1) Create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    } as TransportOptions)
  }

  async send(template: string, subject: string) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    })

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    }

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!')
  }
}

export default Email
