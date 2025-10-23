import userService, { CreateUserInput, UpdateUserInput } from "../service/user.service";
import { Request, Response } from "express";
class UserController{
    async registerUser(req : Request<{},{},CreateUserInput>,res : Response) : Promise<Response>{
        try {
            const user=await userService.createUser(req.body);
            return res.status(201).json(user);
        } catch (error : any) {
            return res.status(400).json({message : error.message});
        }
    }  
    async login(req : Request<{},{},Pick<CreateUserInput,'email'|'password'>>,res : Response) : Promise<Response>{
        try {
            const {email,password}=req.body;
            
            const result=await userService.login(email,password);
            if(!result){
                return res.status(401).json({message : 'Invalid email or password'});
            }

            return res.status(200).json(result);
        } catch (error : any) {
            return res.status(400).json({message : error.message});
        }
    }
    async getUserById(req : Request<{id : string}>,res: Response) : Promise<Response>{
        try {
            const user=await userService.findById(req.params.id);
            if(!user){
                return res.status(404).json({message : 'User not found'});
            }
            return res.status(200).json(user);
        } catch (err : any) {
            return res.status(400).json({message : err.message});
        }
    }
    async getUserByEmail(req : Request<{email : string}>,res : Response) : Promise<Response>{
        try {
            const user=await userService.findUserByEmail(req.params.email);
            if(!user){
                return res.status(404).json({message : 'User not found'});
            }
            return res.status(200).json(user);
        } catch (err : any) {
            return res.status(400).json({message : err.message});
        }
    }
    async updateUser(req : Request<{id : string}, {}, UpdateUserInput>,res: Response) : Promise<Response>{
        try {
            const user=await userService.updateUser(req.params.id, req.body);
            if(!user){
                return res.status(404).json({message : 'User not found'});
            }
            return res.status(200).json(user);
        } catch (err : any) {
            return res.status(400).json({message : err.message});
        }
    }
    async deleteUser(req : Request<{id : string}>,res: Response) : Promise<Response>{
        try {
            const user=await userService.deleteUser(req.params.id);
            if(!user){
                return res.status(404).json({message : 'User not found'});
            }
            return res.status(200).json({message : 'User deleted successfully'});
        } catch (err : any) {
            return res.status(400).json({message : err.message});
        }
    }
}
export default new UserController();