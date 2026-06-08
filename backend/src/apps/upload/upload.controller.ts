import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return callback(new BadRequestException('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const url = await this.uploadService.saveImage(file, hostUrl);

    return { url };
  }
}
