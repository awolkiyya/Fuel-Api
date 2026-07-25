import upload from "./upload.middleware";

export const uploadMiddleware = (
    req:any,
    res:any,
    next:any
   )=>{
    console.log("📂 MULTER START");
   
    upload .single("document")(req,res,(err)=>{
      if(err){
        console.error("❌ MULTER ERROR",err);
        return res.status(400).json({
          message:err.message
        });
      }
   
      console.log("📂 FILE:",req.file);
      next();
    });
   };