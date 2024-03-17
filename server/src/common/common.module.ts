import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [YoutubeService, RedisService],
  exports: [YoutubeService, RedisService],
})
export class CommonModule {}
