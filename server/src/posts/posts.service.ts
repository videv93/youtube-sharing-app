import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { UserCache } from '../auth/auth.interface';
import { EventsGateway } from 'src/events/events.gateway';
import { YoutubeService } from 'src/common/youtube.service';
import { RedisService } from 'src/common/redis.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly eventsGateway: EventsGateway,
    private readonly redisService: RedisService,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  async findAll(user?: UserCache) {
    const posts = await this.postModel.find({}, null, {
      populate: [{ path: 'user', select: 'username' }],
    });
    if (user) {
      for (const post of posts) {
        const isMember = await this.redisService.isMember(
          `post:${post.id}:upvotes`,
          user.sub,
        );
        post.voted = isMember;
      }
    }
    return posts;
  }

  async create(user: UserCache, payload: any) {
    const newPayload = {
      ...payload,
      user: user.sub,
    };
    const newPost = await this.postModel.create(newPayload);
    await newPost.populate('user');
    this.eventsGateway.server.emit('new_post', JSON.stringify(newPost));

    return newPost;
  }

  async upvote(user: UserCache, postId: string) {
    const post = await this.postModel.findById(postId);
    const isMember = await this.redisService.isMember(
      `post:${postId}:upvotes`,
      user.sub,
    );
    if (isMember) {
      return post;
    }
    await this.redisService.addToSet(`post:${postId}:upvotes`, user.sub);
    const upvotes = await this.redisService.countMembers(
      `post:${postId}:upvotes`,
    );
    post.upvotes = upvotes;

    await post.save();
    return post;
  }

  async downvote(user: UserCache, postId: string) {
    const post = await this.postModel.findById(postId);
    const isMember = await this.redisService.isMember(
      `post:${postId}:downvotes`,
      user.sub,
    );
    if (isMember) {
      return post;
    }
    await this.redisService.addToSet(`post:${postId}:downvotes`, user.sub);
    const downvotes = await this.redisService.countMembers(
      `post:${postId}:downvotes`,
    );
    post.downvotes = downvotes;

    await post.save();
    return post;
  }

  async createFromUrl(user: UserCache, url: string) {
    const post = await this.youtubeService.getVideoInfo(url);
    const newPayload = {
      title: post.title,
      description: post.description,
      videoId: post.videoId,
      user: user.sub,
    };
    const newPost = await this.postModel.create(newPayload);
    await newPost.populate('user');
    this.eventsGateway.server.emit('newPost', JSON.stringify(newPost));
    return newPost;
  }
}
