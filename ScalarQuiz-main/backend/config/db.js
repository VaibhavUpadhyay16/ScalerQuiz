import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the URI from environment variables.
 * Equivalent to the original app's local `profiles/*.dat` file persistence,
 * but now backed by a real database (the "M" in MERN).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
