import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import mongoose from 'mongoose';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
    })
      .useMocker((token) => {
        if (token === PostsService) {
          return {
            findAll: vi.fn(),
            upvote: vi.fn(),
            downvote: vi.fn(),
            createFromUrl: vi.fn(),
          };
        }
      })
      .compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  describe('findAll', () => {
    it('should call postsService.findAll and return the result', async () => {
      const user = { username: 'test' };
      const expectedResult = [fakePost];

      jest.spyOn(postsService, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll({ user });

      expect(postsService.findAll).toHaveBeenCalledWith(user);
      expect(result).toBe(expectedResult);
    });
  });

  describe('like', () => {
    it('should call postsService.upvote and return the result', async () => {
      const user = { username: 'test' };
      const postId = 1;
      const expectedResult = fakePost;

      jest.spyOn(postsService, 'upvote').mockResolvedValue(expectedResult);

      const result = await controller.like({ user, params: { id: postId } });

      expect(postsService.upvote).toHaveBeenCalledWith(user, postId);
      expect(result).toBe(expectedResult);
    });
  });

  describe('unlike', () => {
    it('should call postsService.downvote and return the result', async () => {
      const user = { username: 'test' };
      const postId = 1;
      const expectedResult = fakePost;

      jest.spyOn(postsService, 'downvote').mockResolvedValue(expectedResult);

      const result = await controller.unlike({ user, params: { id: postId } });

      expect(postsService.downvote).toHaveBeenCalledWith(user, postId);
      expect(result).toBe(expectedResult);
    });
  });

  describe('create', () => {
    it('should call postsService.createFromUrl and return the result', async () => {
      const user = { username: 'test' };
      const createPostDto = { url: 'https://example.com' };
      const expectedResult = fakePost;

      jest
        .spyOn(postsService, 'createFromUrl')
        .mockResolvedValue(expectedResult);

      const result = await controller.create(
        { user, body: createPostDto },
        createPostDto,
      );

      expect(postsService.createFromUrl).toHaveBeenCalledWith(
        user,
        createPostDto.url,
      );
      expect(result).toBe(expectedResult);
    });
  });
});
