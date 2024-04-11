import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { PostsService } from './posts.service';
import { YoutubeService } from '../common/youtube.service';
import { EventsGateway } from '../events/events.gateway';
import { RedisService } from '../common/redis.service';
import { Post } from './post.schema';
import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/users/user.schema';
import { UserCache } from 'src/auth/auth.interface';

describe('PostsService', () => {
  let service: PostsService;
  let youtubeService: YoutubeService;
  let eventsGateway: EventsGateway;
  let redisService: RedisService;
  let postModel: Model<Post>;

  // variables
  let fakePost: Post;
  let fakeUser: User;
  let fakeUserCache: UserCache;
  let fakePostDocument: any;
  let userId: mongoose.Types.ObjectId;
  let postId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: EventsGateway,
          useValue: {
            server: {
              emit: vi.fn(),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            isMember: vi.fn(),
            addToSet: vi.fn(),
            countMembers: vi.fn(),
          },
        },
        {
          provide: YoutubeService,
          useValue: {
            getVideoInfo: vi.fn(),
          },
        },
        {
          provide: getModelToken(Post.name),
          useValue: {
            create: vi.fn(),
            findById: vi.fn(),
            find: vi.fn(),
            populate: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    youtubeService = module.get<YoutubeService>(YoutubeService);
    eventsGateway = module.get<EventsGateway>(EventsGateway);
    redisService = module.get<RedisService>(RedisService);
    postModel = module.get<Model<Post>>(getModelToken(Post.name));

    fakeUserCache = {
      username: 'username',
      sub: 'sub',
      iat: faker.date.anytime().getTime() / 1000,
      exp: 3600,
    };

    userId = new mongoose.Types.ObjectId();
    fakeUser = {
      _id: userId,
      username: 'test',
      password: 'password',
    };

    postId = new mongoose.Types.ObjectId();
    fakePost = {
      _id: postId,
      title: 'Post 1',
      videoId: 'abc',
      user: fakeUser,
      upvotes: 1,
      downvotes: 1,
      voted: false,
    };

    fakePostDocument = {
      ...fakePost,
      populate: vi.fn().mockResolvedValue(fakePost),
      toObject: vi.fn().mockReturnValue(fakePost),
      save: vi.fn(),
    };
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const user = fakeUserCache;
      const posts = [fakePostDocument];
      const isMemberMock = jest
        .spyOn(redisService, 'isMember')
        .mockResolvedValue(true);
      const findMock = jest.spyOn(postModel, 'find').mockResolvedValue(posts);

      const result = await service.findAll(user);

      expect(findMock).toHaveBeenCalledWith({}, null, {
        populate: [{ path: 'user', select: 'username' }],
      });
      expect(isMemberMock).toHaveBeenCalledWith(
        `post:${postId.toString()}:upvotes`,
        user.sub,
      );
      expect(result).toEqual([fakePost]);
    });

    it('should return all posts without voted property if user is not provided', async () => {
      const posts = [fakePostDocument];
      const findMock = jest.spyOn(postModel, 'find').mockResolvedValue(posts);

      const result = await service.findAll();

      expect(findMock).toHaveBeenCalledWith({}, null, {
        populate: [{ path: 'user', select: 'username' }],
      });
      expect(result).toEqual([fakePost]);
    });
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const user = fakeUserCache;
      const payload = { title: 'Test Post', description: 'Test Description' };
      const newPost = fakePostDocument;
      const createMock = jest
        .spyOn(postModel, 'create')
        .mockResolvedValue(newPost);
      const emitMock = jest.spyOn(eventsGateway.server, 'emit');

      const result = await service.create(user, payload);

      expect(createMock).toHaveBeenCalledWith({ ...payload, user: user.sub });
      // expect(populateMock).toHaveBeenCalledWith('user');
      expect(emitMock).toHaveBeenCalledWith(
        'new_post',
        JSON.stringify(newPost),
      );
      expect(result).toEqual(fakePost);
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
      const saveMock = jest.spyOn(post, 'save').mockResolvedValue(post);

      const result = await service.upvote(user, postId);

      expect(isMemberMock).toHaveBeenCalledWith('post:post1:upvotes', user.sub);
      expect(addToSetMock).toHaveBeenCalledWith('post:post1:upvotes', user.sub);
      expect(countMembersMock).toHaveBeenCalledWith('post:post1:upvotes');
      expect(findByIdMock).toHaveBeenCalledWith(postId);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(fakePost);
    });

    it('should not upvote a post if user has already upvoted', async () => {
      const user = fakeUserCache;
      const post = fakePostDocument;
      const isMemberMock = jest
        .spyOn(redisService, 'isMember')
        .mockResolvedValue(true);
      const findByIdMock = jest
        .spyOn(postModel, 'findById')
        .mockResolvedValue(post);

      const result = await service.upvote(user, postId.toString());

      expect(isMemberMock).toHaveBeenCalledWith(
        `post:${postId.toString()}:upvotes`,
        user.sub,
      );
      expect(findByIdMock).toHaveBeenCalledWith(postId.toString());
      expect(result).toEqual(fakePostDocument);
    });
  });

  describe('downvote', () => {
    it('should downvote a post', async () => {
      const user = fakeUserCache;
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
      const saveMock = jest.spyOn(post, 'save').mockResolvedValue(post);

      const result = await service.downvote(user, postId.toString());

      expect(isMemberMock).toHaveBeenCalledWith(
        `post:${postId.toString()}:downvotes`,
        user.sub,
      );
      expect(addToSetMock).toHaveBeenCalledWith(
        `post:${postId.toString()}:downvotes`,
        user.sub,
      );
      expect(countMembersMock).toHaveBeenCalledWith(
        `post:${postId.toString()}:downvotes`,
      );
      expect(findByIdMock).toHaveBeenCalledWith(postId.toString());
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(fakePost);
    });

    it('should not downvote a post if user has already downvoted', async () => {
      const user = fakeUserCache;
      const post = fakePostDocument;
      const isMemberMock = jest
        .spyOn(redisService, 'isMember')
        .mockResolvedValue(true);
      const findByIdMock = jest
        .spyOn(postModel, 'findById')
        .mockResolvedValue(post);

      const result = await service.downvote(user, postId.toString());

      expect(isMemberMock).toHaveBeenCalledWith(
        `post:${postId.toString()}:downvotes`,
        user.sub,
      );
      expect(findByIdMock).toHaveBeenCalledWith(postId.toString());
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
      const newPost = {
        _id: new mongoose.Types.ObjectId(),
        user,
        voted: false,
        ...videoInfo,
        populate: vi.fn().mockResolvedValue(videoInfo),
        toObject: vi.fn().mockReturnValue(videoInfo),
      };
      const getVideoInfoMock = jest
        .spyOn(youtubeService, 'getVideoInfo')
        .mockResolvedValue(videoInfo);
      const createMock = jest
        .spyOn(postModel, 'create')
        // @ts-expect-error('user' is not assignable to type 'User')
        .mockResolvedValue(newPost);

      const emitMock = jest.spyOn(eventsGateway.server, 'emit');

      await service.createFromUrl(user, url);

      expect(getVideoInfoMock).toHaveBeenCalledWith(url);
      expect(createMock).toHaveBeenCalledWith({ ...videoInfo, user: user.sub });
      expect(emitMock).toHaveBeenCalledWith('newPost', JSON.stringify(newPost));
      // expect(result).toEqual(newPost);
    });
  });
});
