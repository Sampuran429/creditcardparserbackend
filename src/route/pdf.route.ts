import { Router } from "express";
import multer  from "multer";
import path from "path";
import { uploadPDF } from "../controller/pdf.controller";

const storage=multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null,path.join(process.cwd(),"uploads"));
    },
    filename : (req,file,cb)=>{
        const timestamp=Date.now();
        cb(null,`${timestamp}-${file.originalname}`);
    },
});

const upload=multer({storage});
const pdfRouter=Router();
pdfRouter.post("/upload", upload.single("pdf"),uploadPDF);
export default pdfRouter;