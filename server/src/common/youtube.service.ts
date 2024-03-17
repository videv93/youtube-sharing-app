import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private getYoutubeVideoId(url: string) {
    const videoId = url.split('v=')[1];
    const ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      return videoId.substring(0, ampersandPosition);
    }
    return videoId;
  }

  private async getYoutubeTitleDescription(url: string) {
    const apiKey = this.configService.get('YOUTUBE_API_KEY');
    const videoId = this.getYoutubeVideoId(url);
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    this.logger.log('Fetching videos...', youtubeApiUrl);
    const response = await this.httpService.axiosRef.get(youtubeApiUrl);
    const video = response.data.items[0].snippet;
    return {
      videoId,
      title: video.title,
      description: video.description,
    };
  }

  async getVideoInfo(url: string) {
    const info = await this.getYoutubeTitleDescription(url);
    this.logger.log('Video info', info);
    return info;
  }
}
