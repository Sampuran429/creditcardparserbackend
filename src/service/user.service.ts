import { console } from "inspector";
import UserModel,{User} from "../model/user.model"
import {MongoError} from "mongodb";
export type CreateUserInput=Omit<User, 'comparePassword' | 'generateAuthToken'> &{password : string};
export interface UpdateUserInput{
    username ? : string;
    email ? : string;
    password ? : string;
}
class UserService{
    async createUser(input : CreateUserInput) : Promise<User>{
        try {
            const user=await UserModel.create(input);
            user.password=undefined;
            return user;
        } catch (error :any) {
            if(error instanceof MongoError && error.code === 11000){
                throw new Error('Email already exists');
            }
            throw error;
        }
    }
    async findUserByEmail(email : string) : Promise<User | null>{
        try {
            const user=await UserModel.findOne({email}).select('+password');
            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async findById(userId : string) : Promise<User | null>{
        try {
            const user=await UserModel.findById(userId);
            return user;    
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async updateUser(userId : string,update : UpdateUserInput) : Promise<User | null>{
        try {
            const user=await UserModel.findByIdAndUpdate(userId,update,{new : true});
            if(user){
                user.password=undefined;
            }
            return user;
        } catch (error) {
            if(error instanceof MongoError && error.code === 11000){
                throw new Error('Email already exists');
            }
            throw error;
        }
    }
    async deleteUser(userId : string) : Promise<User | null>{
        try {
            const user=await UserModel.findByIdAndDelete(userId);
            if(!user){
                throw new Error('User not found');
            }
            user.password=undefined;
            return user;
        } catch (error) {
            if(error instanceof MongoError){
                throw new Error('Error deleting user');
            }
            throw error;
        }
    }
    async login(email : string,password : string) : Promise<{user : User, token : string} | null>{
        try {
            const user=await this.findUserByEmail(email);
            
            if(!user || !user.password){
                return null;
            }
            const isMatch=await user.comparePassword(password);
            if(!isMatch){
                return null;
            }
            const token=user.generateAuthToken();
            
            user.password=undefined;
            return {user, token};
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}
export default new UserService();