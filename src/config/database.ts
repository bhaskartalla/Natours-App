import mongoose from 'mongoose'

const connectDB = async (): Promise<void> => {
  const DB =
    process.env.IS_LOCAL_DB === 'true'
      ? process.env.DATABASE_LOCAL
      : process.env.DATABASE?.replace(
          '<PASSWORD>',
          process.env.DATABASE_PASSWORD ?? '',
        )

  await mongoose.connect(DB as string)
  console.log('🖲️ ~ Database connected successfully:', DB)
}

export default connectDB