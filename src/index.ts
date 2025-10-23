import dotenv from 'dotenv';
dotenv.config(); // Move this to the top
import express,{Express} from 'express';
import cors from 'cors';
import dbConnection from './config/db';
import userRouter from './route/user.route';
import pdfRouter from './route/pdf.route';
import path from 'path';
const app : Express=express();
const port=process.env.PORT || 5000;
dbConnection();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use('/api/users',userRouter);
app.use('/api/pdf',pdfRouter);
app.get('/',(req,res)=>{
    res.send('API is running...');
});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
}); 