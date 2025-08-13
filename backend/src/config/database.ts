import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bpa_platform';
    console.log(`🔌 Connecting to MongoDB: ${mongoURI}`);
    
    await mongoose.connect(mongoURI);
    
    console.log('📦 MongoDB Connected Successfully');
    console.log(`🗄️  Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;
