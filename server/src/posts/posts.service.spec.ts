import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { PostsService } from './posts.service';
import { YoutubeService } from 'src/common/youtube.service';
import { EventsGateway } from 'src/events/events.gateway';
import { RedisService } from 'src/common/redis.service';
import { Post } from './post.schema';
import { faker } from '@faker-js/faker';

describe('PostsService', () => {
  let service: PostsService;
  let youtubeService: YoutubeService;
  let eventsGateway: EventsGateway;
  let redisService: RedisService;
  let postModel: Model<Post>;

  const fakeUserCache = {
    username: 'username',
    sub: 'sub',
    iat: faker.date.anytime().getTime() / 1000,
    exp: 3600,
  };

  const fakeUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'test',
    password: 'password',
  };

  const fakePost = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Post 1',
    videoId: 'abc',
    user: fakeUser,
    upvotes: 0,
    downvotes: 0,
    voted: false,
  };

  const fakePostDocument = {
    ...fakePost,
    toObject: jest.fn().mockReturnValue(fakePost),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        YoutubeService,
        EventsGateway,
        RedisService,
        { provide: Model, useValue: {} },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    youtubeService = module.get<YoutubeService>(YoutubeService);
    eventsGateway = module.get<EventsGateway>(EventsGateway);
    redisService = module.get<RedisService>(RedisService);
    postModel = module.get<Model<Post>>(Model);
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const user = fakeUserCache;
      const posts = [fakePost];
      const isMemberMock = jest
        .spyOn(redisService, 'isMember')
        .mockResolvedValue(true);
      const findMock = jest.spyOn(postModel, 'find').mockResolvedValue(posts);

      const result = await service.findAll(user);

      expect(findMock).toHaveBeenCalledWith({}, null, {
        populate: [{ path: 'user', select: 'username' }],
      });
      expect(isMemberMock).toHaveBeenCalledWith('post:post1:upvotes', user.sub);
      expect(isMemberMock).toHaveBeenCalledWith('post:post2:upvotes', user.sub);
      expect(result).toEqual(posts);
    });

    it('should return all posts without voted property if user is not provided', async () => {
      const posts = [{ id: 'post1' }, { id: 'post2' }];
      const findMock = jest.spyOn(postModel, 'find').mockResolvedValue(posts);

      const result = await service.findAll();

      expect(findMock).toHaveBeenCalledWith({}, null, {
        populate: [{ path: 'user', select: 'username' }],
      });
      expect(result).toEqual(posts);
    });
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const user = fakeUserCache;
      const payload = { title: 'Test Post', description: 'Test Description' };
      const newPost = fakePostDocument;
      const createMock = jest
        .spyOn(postModel, 'create')
        // @ts-expect-error('toObject' does not exist on type 'Post')
        .mockResolvedValue(newPost);
      const populateMock = jest
        .spyOn(postModel, 'populate')
        // @ts-expect-error('toObject' does not exist on type 'Post')
        .mockResolvedValue(newPost);
      const emitMock = jest.spyOn(eventsGateway.server, 'emit');

      const result = await service.create(user, payload);

      expect(createMock).toHaveBeenCalledWith({ ...payload, user: user.sub });
      expect(populateMock).toHaveBeenCalledWith('user');
      expect(emitMock).toHaveBeenCalledWith(
        'new_post',
        JSON.stringify(newPost),
      );
      expect(result).toEqual(newPost);
    });
  });

  describe('upvote', () => {
    it('should upvote a post', async () => {
      const user = fakeUserCache;
      const postId = 'post1';
      const post = fakePostDocument;
      const isMemberMock = jest
        .spyOn(redisService, 'isMember')
        .mockResolvedValue(false);
      const addToSetMock = jest.spyOn(redisService, 'addToSet');
      const countMembersMock = jest
        .spyOn(redisService, 'countMembers')
        .mockResolvedValue(1);
      const findByIdMock = jest
        .spyOn(postModel, 'findById')
        .mockResolvedValue(post);
      // @ts-expect-error('toObject' does not exist on type 'Post')
      const saveMock = jest.spyOn(post, 'save').mockResolvedValue(post);

      const result = await service.upvote(user, postId);

      expect(isMemberMock).toHaveBeenCalledWith('post:post1:upvotes', user.sub);
      expect(addToSetMock).toHaveBeenCalledWith('post:post1:upvotes', user.sub);
      expect(countMembersMock).toHaveBeenCalledWith('post:post1:upvotes');
      expect(findByIdMock).toHaveBeenCalledWith(postId);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(post);
    });

    it('should not upvote a post if user has already upvoted', async () => {
      const user = fakeUserCache;
      const postId = 'post1';
      const post = { id: postId, upvotes: 0 };
      const isMemberMock = jest
        .spyOn(redisService, 'isMember')
        .mockResolvedValue(true);
      const findByIdMock = jest
        .spyOn(postModel, 'findById')
        .mockResolvedValue(post);

      const result = await service.upvote(user, postId);

      expect(isMemberMock).toHaveBeenCalledWith('post:post1:upvotes', user.sub);
      expect(findByIdMock).toHaveBeenCalledWith(postId);
      expect(result).toEqual(post);
    });
  });

  describe('downvote', () => {
    it('should downvote a post', async () => {
      const user = fakeUserCache;
      const postId = 'post1';
      const post = fakePostDocument;
      const isMemberMock = jest
        .spyOn(redisService, 'isMember')
        .mockResolvedValue(false);
      const addToSetMock = jest.spyOn(redisService, 'addToSet');
      const countMembersMock = jest
        .spyOn(redisService, 'countMembers')
        .mockResolvedValue(1);
      const findByIdMock = jest
        .spyOn(postModel, 'findById')
        .mockResolvedValue(post);
      // @ts-expect-error('toObject' does not exist on type 'Post')
      const saveMock = jest.spyOn(post, 'save').mockResolvedValue(post);

      const result = await service.downvote(user, postId);

      expect(isMemberMock).toHaveBeenCalledWith(
        'post:post1:downvotes',
        user.sub,
      );
      expect(addToSetMock).toHaveBeenCalledWith(
        'post:post1:downvotes',
        user.sub,
      );
      expect(countMembersMock).toHaveBeenCalledWith('post:post1:downvotes');
      expect(findByIdMock).toHaveBeenCalledWith(postId);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(post);
    });

    it('should not downvote a post if user has already downvoted', async () => {
      const user = fakeUserCache;
      const postId = 'post1';
      const post = { id: postId, downvotes: 0 };
      const isMemberMock = jest
        .spyOn(redisService, 'isMember')
        .mockResolvedValue(true);
      const findByIdMock = jest
        .spyOn(postModel, 'findById')
        .mockResolvedValue(post);

      const result = await service.downvote(user, postId);

      expect(isMemberMock).toHaveBeenCalledWith(
        'post:post1:downvotes',
        user.sub,
      );
      expect(findByIdMock).toHaveBeenCalledWith(postId);
      expect(result).toEqual(post);
    });
  });

  describe('createFromUrl', () => {
    it('should create a new post from a YouTube video URL', async () => {
      const user = fakeUserCache;
      const url = 'https://www.youtube.com/watch?v=video123';
      const videoInfo = {
        title: 'Test Video',
        description: 'Test Description',
        videoId: 'video123',
      };
      const newPost = fakePostDocument;
      const getVideoInfoMock = jest
        .spyOn(youtubeService, 'getVideoInfo')
        .mockResolvedValue(videoInfo);
      const createMock = jest
        .spyOn(postModel, 'create')
        // @ts-expect-error('toObject' does not exist on type 'Post')
        .mockResolvedValue(newPost);
      const populateMock = jest
        .spyOn(postModel, 'populate')
        // @ts-expect-error('toObject' does not exist on type 'Post')

        .mockResolvedValue(newPost);
      const emitMock = jest.spyOn(eventsGateway.server, 'emit');

      const result = await service.createFromUrl(user, url);

      expect(getVideoInfoMock).toHaveBeenCalledWith(url);
      expect(createMock).toHaveBeenCalledWith(newPost);
      expect(populateMock).toHaveBeenCalledWith('user');
      expect(emitMock).toHaveBeenCalledWith('newPost', JSON.stringify(newPost));
      expect(result).toEqual(newPost);
    });
  });
});
