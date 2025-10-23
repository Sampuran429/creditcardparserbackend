import { Request, Response , NextFunction} from "express";
import jwt from 'jsonwebtoken';
import UserModel from "../model/user.model";
interface AuthenticatedRequest extends Request {
    userId? : string;
}
const authMiddleware=async(req : AuthenticatedRequest,res : Response,next : NextFunction)=>{
    try {
        const token=req.header('Authorization')?.replace('Bearer ', '');
        console.log('Token:', token);
        if(!token){
            throw new Error('No token provided');
        }
        const decoded : any =jwt.verify(token,process.env.JWT_SECRET!);
        console.log('Decoded:', decoded);
        const user = await UserModel.findOne({ _id: decoded.id }) as { _id: string };
        console.log('User:', user);
        if(!user){
            throw new Error('User not found');
        }
        req.userId=user._id.toString();
        next();
    } catch (error : any) {
        console.log('Auth Middleware Error:', error.message);
        res.status(401).send({ error: error.message });
    }
}
export default authMiddleware;