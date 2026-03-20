const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/image-resizer";
        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        console.error("Please ensure your MongoDB server is running or MONGO_URI is set correctly in .env.");
        process.exit(1);
    }
};

module.exports = connectDB;
