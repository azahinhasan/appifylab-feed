import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import type { UploadedImageFile } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return callback(
            new BadRequestException('Only image files (jpg, jpeg, png, gif, webp) are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Req() req: any,
    @Body() dto: CreatePostDto,
    @UploadedFile() file?: UploadedImageFile | null,
  ) {
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    return this.postsService.create(req.user.id, dto, file, hostUrl);
  }

  @Get()
  async getFeed(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : 10;
    return this.postsService.getFeed(req.user.id, parsedLimit, cursor);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.postsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.postsService.delete(id, req.user.id);
  }

  @Post(':id/like')
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.postsService.toggleLike(id, req.user.id);
  }

  @Get(':id/likes')
  async getLikes(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.postsService.getLikes(id, limit, cursor);
  }
}
