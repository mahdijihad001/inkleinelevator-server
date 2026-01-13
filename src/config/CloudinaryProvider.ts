import { v2 as cloudinary } from "cloudinary"

export const CloudinaryProvider = {
    provide: "CLOUDINARY",
    useFactory: () => {
        cloudinary.config({
            cloud_name: "dpt1l3rco",
            api_key: "433467254541546",
            api_secret: "wkGG0JKSf0IP8R8cdOFSLnTSpEE"
        })
        return cloudinary
    }
}