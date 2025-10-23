import path, { parse } from "path";
import fs from "fs";
import {Request,Response} from "express";
import pdfParserServiceService from "../service/pdfParserService.service";
import ParsedStatementModel, { IParsedStatement } from "../model/parsedStatement.model";
const uploadDir=path.join(process.cwd(),"uploads");
fs.mkdirSync(uploadDir,{recursive : true});

export const uploadPDF=async (req : Request,res : Response)=>{
    console.log("file name is ---------------",req.file);
    if(!req.file){
        return res.status(400).json({message : "No File Upload"});
    }
    const filePath=req.file.path;
    console.log("file path is -----------",filePath);
    try {
        const parseResult=await pdfParserServiceService.parsePDF(filePath);
        console.log("parsed result is -------------",parseResult);
        if(parseResult.status==="parsed" && parseResult.parsedFields){
            const doc : IParsedStatement=new ParsedStatementModel({
                originalName : req.file.originalname,
                filePath : req.file.path,
                rawText : parseResult.rawText,
                parsedFields : parseResult.parsedFields,
                issuer : parseResult.issuer,
                status : parseResult.status,
            })
            await doc.save();
        }
        fs.unlinkSync(filePath);
        return res.status(200).json(parseResult);
    } catch (error : any) {
        console.error("PDF upload and parsing failed:", error.message);
        console.log(error);
        fs.unlinkSync(filePath);
        return res.status(500).json({message : "Internal Server Error"});
    }
}