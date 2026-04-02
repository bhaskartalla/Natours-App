import mongoose from 'mongoose'
import dotenv from 'dotenv'
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

dotenv.config({ path: `${__dirname}/config.env` })

import app from './app'

const DB = process.env.DATABASE?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD ?? '',
)

mongoose.connect(DB as string).then((con) => {
  console.log('🖲️ ~ Databse connected successfully:')
})

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`💻 App running on port ${port}...`)
})

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...', {
    name: err.name,
    message: err.message,
  })
  server.close(() => process.exit(1))
})
