import mongoose, { Connection } from 'mongoose';

// const MONGODB_URI = "mongodb+srv://sudais:Sudais@cluster0.jhhep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI = "mongodb://localhost:27017/";



if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required');
}

let cachedConnection: Connection | null = null;

async function connectToDatabase(): Promise<Connection> {
  if (cachedConnection) {
    return cachedConnection;
  }
  try {
    const mongooseInstance = await mongoose.connect(MONGODB_URI, { bufferCommands: false, dbName: "LAS_TAAPS", maxPoolSize: 10});
    cachedConnection = mongooseInstance.connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }

  return cachedConnection;
}

export default connectToDatabase;
