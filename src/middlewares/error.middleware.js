import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler =(err,req,res,next)=>{
    let error = err
    
    if (!(error instanceof ApiError)) {
        const StatusCode = Error.StatusCode || error instanceof mongoose.Error ? 400 :500
        
       const message = error.message || "Something went wrong"
       error = new ApiError(StatusCode, message, error.errors || [], err.stack)

    }

    const response ={
        ...error,
        message:error.message,
         ...(process.env.NODE_ENV === "development" ? {stack:error.stack}:{})
    }
 return res.status(err.statusCode || 500).json({
  success: false,
  message: err.message || "Internal Server Error",
});

}

export {errorHandler}