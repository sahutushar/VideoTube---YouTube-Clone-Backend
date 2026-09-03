// import { v2 as cloudinary } from "cloudinary";
// import { log } from "console";
// import fs from "fs"
// import dotenv from "dotenv"

// dotenv.config()


//     // Configuration
//     cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
//         api_key:  process.env.CLOUDINARY_API_KEY ,
//         api_secret:  process.env.CLOUDINARY_API_SECRET 
//     });

// const uploadOnCloudinary = async (LocalFilePath) =>{
//     try {
//         if(!LocalFilePath) return null ;
//        const response= await cloudinary.uploader.upload(
//             LocalFilePath,{
//                 resource_type:"auto"
//             }
//         );

//    console.log("File uploaded on cloudinary. File src:" + response.url);

//    // once the file is uploaded , we would like to delete it from our server

//    fs.unlinkSync(LocalFilePath);
//    return response; 

//     } catch (error) {
//        fs.unlinkSync(LocalFilePath)
//        return null
//     }
// };

// const deleteFromCloudinary = async (publicId) =>{
//     try {
//        const result = await cloudinary.uploader.destroy(publicId)
//        console.log("Deleted from cloudinary ,publicId ")
//     } catch (error) {
//         console.log("Error deleting from cloudinary",error)
//         return null
//     }
// }

// export {uploadOnCloudinary , deleteFromCloudinary}

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({
      path: "./.env"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath); // Delete after upload
    return response;
  } catch (error) {
    console.log("Cloudinary Upload Error:", error);
    return null;
  }
};

export const deleteFromCloudinary = async (public_id) => {
  try {
    if (!public_id) return null;
    return await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.log("Error deleting from Cloudinary:", error);
    return null;
  }
};
