import mongoose from 'mongoose';

const MONGODB_URI = "mongodb://localhost:27017/";
const DB_NAME = "LAS_TAAPS";

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required');
}

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = { conn: null, promise: null };

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: DB_NAME,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;