import mongoose, { Schema } from "mongoose";

export interface IParsedFields{
    cardVariant?: string;
    last4Digits?: string;
    billingCycle?: string;
    paymentDueDate?: string;
    totalBalance?: string;
    confidence: number;
}
export interface IParsedStatement extends mongoose.Document{
    originalName : string;
    filePath : string;
    issuer : string |null;
    status : 'uploaded' | 'parsing' | 'parsed' | 'failed';
    rawText?: string | null;
    tabulaTables?: any;
    parsedFields?: IParsedFields;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}
const parsedStatementSchema=new Schema<IParsedStatement>({
    originalName :{
        type : String,
        required : true,
    },
    filePath : {
        type : String,
        required : true,
    },
    issuer : {
        type : String,
        default : null,
    },
    status : {
        type : String,
        enum : ['uploaded', 'parsing', 'parsed', 'failed'],
        default : 'uploaded',
    },
    rawText : {
        type : String,
        default : null,
    },
    tabulaTables : Schema.Types.Mixed,
    parsedFields :{
        cardVariant : String,
        last4Digits : String,
        billingCycle : String,
        paymentDueDate : String,
        totalBalance : String,
        confidence : { type: Number, default: 0 },
    },
    error : { type: String, default: null },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

export const ParsedStatementModel=mongoose.model<IParsedStatement>('ParsedStatement', parsedStatementSchema);
export default ParsedStatementModel;