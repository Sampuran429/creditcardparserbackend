import mongoose from "mongoose";

export interface User extends mongoose.Document{
    username : string;
    email : string;
    password? : string;
    comparePassword(candidatePassword : string) : Promise<boolean>;
    generateAuthToken() : string;
}
const userSchema=new mongoose.Schema({
    username :{
        type : String,
        required : true,
        trim : true,
        minLength : 3
    },
    email :{
        type :String,
        required: true,
        trim: true,
        minLength: 5,
        unique: true,
        match : /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    },
    password :{
        type : String,
        required : true,
        minLength : 6,
        select : false
    }
},{timestamps : true    
});
userSchema.pre<User> ('save' , async function(next){
    if(!this.isModified('password')){
        next();
    }
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
});

userSchema.methods.comparePassword=async function(candidatePassword : string) : Promise<boolean>{
    const bcrypt=await import('bcryptjs');
    return bcrypt.compare(candidatePassword, this.password);
}
userSchema.methods.generateAuthToken=function() : string{
    const jwt=require('jsonwebtoken');
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return token;
}
export const UserModel=mongoose.model<User>('User', userSchema);
export default UserModel;