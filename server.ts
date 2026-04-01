import mongoose from 'mongoose'
import dotenv from 'dotenv'
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
app.listen(port, () => {
  console.log(`💻 App running on port ${port}...`)
})
