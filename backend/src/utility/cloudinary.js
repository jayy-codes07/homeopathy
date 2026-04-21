import { v2 as cloudinary } from 'cloudinary';

export const uploadtocloudinary = async function (url) {

    // Configuration
    cloudinary.config({
        cloud_name: 'dduesmocu',
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader
        .upload(url)
        .catch((error) => {
            console.log("error while uploading avatar", error);
        });

    console.log(uploadResult);


};