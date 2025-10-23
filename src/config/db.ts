import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const dbConnection=async()=>{
    try {
        const dbUri=process.env.MONGO_URI as string;
        if(!dbUri){
            throw new Error("MongoDB URI is not defined in environment variables");
        }
        await mongoose.connect(dbUri);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
}
export default dbConnection;