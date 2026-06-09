import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.user.id, dto);
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
