const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🚀 MongoDB Connected Sync: ${conn.connection.host}`);
  } catch (error) {
  console.error("FULL ERROR:");
  console.error(error);
  process.exit(1);
}
};

module.exports = connectDB;