import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../users/user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  _id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
  })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
  })
  videoId: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({
    default: 0,
  })
  upvotes: number;

  @Prop({
    default: 0,
  })
  downvotes: number;

  voted: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
