const mongoose = require('mongoose');
const dns = require('dns');

// ⚠️  FIX: Node.js on this machine defaults to DNS server 127.0.0.1
// (nothing listening there), while PowerShell uses the real Wi-Fi DNS.
// We override Node's resolver to use Google + Cloudflare public DNS.
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // Force IPv4
    });
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;