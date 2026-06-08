import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../../database/schemas/comment.schema';
import { Post, PostDocument } from '../../database/schemas/post.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async create(postId: string, userId: string, dto: CreateCommentDto): Promise<CommentDocument> {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    let parentId: Types.ObjectId | null = null;
    if (dto.parentComment) {
      const parent = await this.commentModel.findById(dto.parentComment).exec();
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
      if (parent.post.toString() !== postId) {
        throw new BadRequestException('Parent comment must belong to the same post');
      }
      parentId = new Types.ObjectId(dto.parentComment);
    }

    const comment = await this.commentModel.create({
      content: dto.content,
      author: new Types.ObjectId(userId),
      post: new Types.ObjectId(postId),
      parentComment: parentId,
      likedBy: [],
    });

    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }).exec();

    return comment.populate('author', 'firstName lastName email');
  }

  async getCommentsForPost(postId: string, limit = 10, cursor?: string) {
    const query: any = {
      post: new Types.ObjectId(postId),
      parentComment: null,
    };

    if (cursor) {
      query._id = { $gt: new Types.ObjectId(cursor) };
    }

    const topComments = await this.commentModel
      .find(query)
      .sort({ createdAt: 1 })
      .limit(limit + 1)
      .populate('author', 'firstName lastName email')
      .lean()
      .exec();

    const hasNextPage = topComments.length > limit;
    if (hasNextPage) {
      topComments.pop();
    }

    const nextCursor = hasNextPage ? topComments[topComments.length - 1]._id.toString() : null;

    const topCommentIds = topComments.map((c) => c._id);
    const replies = await this.commentModel
      .find({
        post: new Types.ObjectId(postId),
        parentComment: { $in: topCommentIds },
      })
      .sort({ createdAt: 1 })
      .populate('author', 'firstName lastName email')
      .lean()
      .exec();

    const commentsWithReplies = topComments.map((comment) => ({
      ...comment,
      replies: replies.filter((r) => r.parentComment!.toString() === comment._id.toString()),
    }));

    return {
      comments: commentsWithReplies,
      nextCursor,
    };
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentModel.findByIdAndDelete(commentId).exec();
    await this.commentModel.deleteMany({ parentComment: comment._id }).exec();
    await this.postModel.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } }).exec();

    return { success: true };
  }

  async toggleLike(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const likedIndex = comment.likedBy.findIndex(
      (id) => id.toString() === userId,
    );

    let liked = false;
    if (likedIndex > -1) {
      comment.likedBy.splice(likedIndex, 1);
    } else {
      comment.likedBy.push(userObjectId);
      liked = true;
    }

    await comment.save();

    return {
      success: true,
      liked,
      likesCount: comment.likedBy.length,
    };
  }

  async getLikes(commentId: string) {
    const comment = await this.commentModel
      .findById(commentId)
      .populate('likedBy', 'firstName lastName email')
      .lean()
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return {
      likes: comment.likedBy,
    };
  }
}
