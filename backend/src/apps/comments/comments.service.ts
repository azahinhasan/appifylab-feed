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

  // Use Mongo transactions so simultaneous create/delete calls keep commentsCount in sync
  async create(postId: string, userId: string, dto: CreateCommentDto): Promise<CommentDocument> {
    const session = await this.commentModel.db.startSession();
    let createdComment: CommentDocument | null = null;

    try {
      await session.withTransaction(async () => {
        const post = await this.postModel.findById(postId).session(session).exec();
        if (!post) {
          throw new NotFoundException('Post not found');
        }

        let parentId: Types.ObjectId | null = null;
        if (dto.parentComment) {
          const parent = await this.commentModel.findById(dto.parentComment).session(session).exec();
          if (!parent) {
            throw new NotFoundException('Parent comment not found');
          }
          if (parent.post.toString() !== postId) {
            throw new BadRequestException('Parent comment must belong to the same post');
          }
          parentId = new Types.ObjectId(dto.parentComment);
        }

        const [comment] = await this.commentModel.create(
          [
            {
              content: dto.content,
              author: new Types.ObjectId(userId),
              post: new Types.ObjectId(postId),
              parentComment: parentId,
              likedBy: [],
            },
          ],
          { session },
        );

        await this.postModel
          .updateOne({ _id: postId }, { $inc: { commentsCount: 1 } }, { session })
          .exec();

        createdComment = await comment.populate('author', 'firstName lastName email');
      });
    } finally {
      await session.endSession();
    }

    if (!createdComment) {
      throw new Error('Failed to create comment');
    }

    return createdComment;
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
    const session = await this.commentModel.db.startSession();
let totalRemoved = 0;

    try {
      await session.withTransaction(async () => {
        const comment = await this.commentModel.findById(commentId).session(session).exec();
        if (!comment) {
          throw new NotFoundException('Comment not found');
        }

        if (comment.author.toString() !== userId) {
          throw new ForbiddenException('You can only delete your own comments');
        }

        const postObjectId = new Types.ObjectId(comment.post.toString());

        const repliesDeletion = await this.commentModel
          .deleteMany({ parentComment: comment._id })
          .session(session)
          .exec();
        const repliesRemoved = repliesDeletion.deletedCount ?? 0;
        totalRemoved = 1 + repliesRemoved;

        await this.commentModel.deleteOne({ _id: commentId }).session(session).exec();

        const updatedPost = await this.postModel
          .findByIdAndUpdate(
            postObjectId,
            { $inc: { commentsCount: -totalRemoved } },
            { new: true, session },
          )
          .exec();

        if (updatedPost && updatedPost.commentsCount < 0) {
          updatedPost.commentsCount = 0;
          await updatedPost.save({ session });
        }
      });
    } finally {
      await session.endSession();
    }

    return { success: true, removed: totalRemoved };
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
