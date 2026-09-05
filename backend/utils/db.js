const mongoose = require('mongoose');
const URI = process.env.MONGODB_URI || process.env.MONGO_URI;
//await mongose.connect(URL);
const connectDB = async () => {
    try {
        if (!URI) {
            throw new Error("Missing MongoDB connection string. Set MONGODB_URI or MONGO_URI in backend/.env");
        }
        await mongoose.connect(URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed", error);
        process.exit(1);
    };
    
}
module. exports= connectDB;
