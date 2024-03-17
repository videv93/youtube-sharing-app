import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { CreatePostDto } from './posts.dto';
import { PostsService } from './posts.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  async findAll(@Request() request) {
    const user = request.user;
    return this.postsService.findAll(user);
  }

  @Post(':id/upvote')
  async like(@Request() request) {
    const user = request.user;
    const postId = request.params.id;
    return this.postsService.upvote(user, postId);
  }

  @Post(':id/downvote')
  async unlike(@Request() request) {
    const user = request.user;
    const postId = request.params.id;
    return this.postsService.downvote(user, postId);
  }

  @Post()
  async create(@Request() request, @Body() createPostDto: CreatePostDto) {
    const user = request.user;
    const url = createPostDto.url;
    return this.postsService.createFromUrl(user, url);
  }
}
