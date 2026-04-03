import nodemailer, { type TransportOptions } from 'nodemailer'

type EmailOptions = {
  to: string
  subject: string
  message: string
}

export const sendEmail = async (options: EmailOptions) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as TransportOptions)

  // 2) Define the email options
  const mailOptions = {
    from: 'Bhaskar Talla <bhaskar.talla@ves.ac.in>',
    to: options.to,
    subject: options.subject,
    text: options.message,
    // html:
  }

  // 3) Actually send the email
  await transporter.sendMail(mailOptions)
}
