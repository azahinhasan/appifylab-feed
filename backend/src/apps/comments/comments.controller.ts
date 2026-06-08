import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('posts/:postId/comments')
  async create(
    @Param('postId') postId: string,
    @Req() req: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, req.user.id, dto);
  }

  @Get('posts/:postId/comments')
  async getComments(
    @Param('postId') postId: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : 10;
    return this.commentsService.getCommentsForPost(postId, parsedLimit, cursor);
  }

  @Delete('comments/:id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.delete(id, req.user.id);
  }

  @Post('comments/:id/like')
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.toggleLike(id, req.user.id);
  }

  @Get('comments/:id/likes')
  async getLikes(@Param('id') id: string) {
    return this.commentsService.getLikes(id);
  }
}
