import connectDB from './config/database'
import dotenv from 'dotenv'

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    name: err.name,
    message: err.message,
  })
  process.exit(1)
})

dotenv.config({ path: `${process.cwd()}/config.env` })

import app from './app'

// Database connection
connectDB()

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`💻 App running on ${process.env.NODE_ENV} port ${port}...`)
})

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...', {
    name: err.name,
    message: err.message,
  })
  server.close(() => process.exit(1))
})
