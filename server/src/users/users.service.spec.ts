import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User } from './user.schema';

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const payload = { username: 'testuser', password: 'testpassword' };
      const createdUser = { _id: new mongoose.Types.ObjectId(), ...payload };
      const createdUserDocument = {
        toObject: jest.fn().mockReturnValue(createdUser),
        ...createdUser,
      };

      jest
        .spyOn(userModel, 'create')
        // @ts-expect-error('toObject' does not exist on type 'Post')
        .mockResolvedValueOnce(createdUserDocument);

      const result = await usersService.create(payload);

      expect(userModel.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findOne', () => {
    it('should find a user by username', async () => {
      const username = 'testuser';
      const foundUser = { _id: '1', username, password: 'testpassword' };

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(foundUser);

      const result = await usersService.findOne(username);

      expect(userModel.findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(foundUser);
    });

    it('should return undefined if user is not found', async () => {
      const username = 'nonexistentuser';

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

      const result = await usersService.findOne(username);

      expect(userModel.findOne).toHaveBeenCalledWith({ username });
      expect(result).toBeUndefined();
    });
  });
});
