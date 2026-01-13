import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary) {}

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error : any, result : any) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }
}
