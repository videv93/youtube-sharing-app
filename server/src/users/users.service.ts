import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(payload: any) {
    const user = await this.userModel.create(payload);
    return user.toObject();
  }

  async findOne(username: string): Promise<User | undefined> {
    return (await this.userModel.findOne({ username })).toObject();
  }
}
