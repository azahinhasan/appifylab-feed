import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../../database/schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async create(userId: string, dto: CreatePostDto): Promise<PostDocument> {
    const post = await this.postModel.create({
      content: dto.content,
      imageUrl: dto.imageUrl || null,
      visibility: dto.visibility || 'public',
      author: new Types.ObjectId(userId),
      likedBy: [],
      commentsCount: 0,
    });
    return post.populate('author', 'firstName lastName email');
  }

  async getFeed(userId: string, limit = 10, cursor?: string) {
    const query: any = {
      $or: [
        { visibility: 'public' },
        { author: new Types.ObjectId(userId) },
      ],
    };

    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('author', 'firstName lastName email')
      .lean()
      .exec();

    const hasNextPage = posts.length > limit;
    if (hasNextPage) {
      posts.pop();
    }

    const nextCursor = hasNextPage ? posts[posts.length - 1]._id.toString() : null;

    return {
      posts,
      nextCursor,
    };
  }

  async findOne(postId: string, userId: string): Promise<PostDocument> {
    const post = await this.postModel
      .findById(postId)
      .populate('author', 'firstName lastName email')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.visibility === 'private' && post.author.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this private post');
    }

    return post;
  }

  async delete(postId: string, userId: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenException('Only the author can delete this post');
    }

    await this.postModel.deleteOne({ _id: post._id }).exec();
    return { success: true, message: 'Post deleted successfully' };
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = post.likedBy.some((id: any) => id.toString() === userId);

    let updatedPost;
    if (hasLiked) {
      updatedPost = await this.postModel
        .findByIdAndUpdate(
          postId,
          { $pull: { likedBy: userObjectId } },
          { new: true }
        )
        .populate('author', 'firstName lastName email')
        .exec();
    } else {
      updatedPost = await this.postModel
        .findByIdAndUpdate(
          postId,
          { $addToSet: { likedBy: userObjectId } },
          { new: true }
        )
        .populate('author', 'firstName lastName email')
        .exec();
    }

    return updatedPost;
  }

  async getLikes(postId: string, limit = 10, cursor?: string) {
    const post = await this.postModel
      .findById(postId)
      .populate('likedBy', 'firstName lastName email')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      likes: post.likedBy,
    };
  }
}
