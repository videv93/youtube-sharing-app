import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostsService],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  describe('findAll', () => {
    it('should call postsService.findAll and return the result', async () => {
      const user = { username: 'test' };
      const expectedResult = [{ id: 1, title: 'Post 1' }];

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
      const expectedResult = { id: 1, title: 'Post 1', likes: 1 };

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
      const expectedResult = { id: 1, title: 'Post 1', likes: 0 };

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
      const expectedResult = {
        id: 1,
        title: 'New Post',
        url: 'https://example.com',
      };

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
