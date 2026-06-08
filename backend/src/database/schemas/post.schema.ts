import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: String, default: null })
  imageUrl: string | null;

  @Prop({ type: String, enum: ['public', 'private'], default: 'public' })
  visibility: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  author: Types.ObjectId | User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likedBy: (Types.ObjectId | User)[];

  @Prop({ type: Number, default: 0 })
  commentsCount: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, visibility: 1 });
PostSchema.index({ visibility: 1, createdAt: -1 });
