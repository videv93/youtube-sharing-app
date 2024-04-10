import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeService } from './youtube.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

describe('YoutubeService', () => {
  let service: YoutubeService;
  let configService: ConfigService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YoutubeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('YOUR_YOUTUBE_API_KEY'),
          },
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              get: jest.fn().mockResolvedValue({
                data: {
                  items: [
                    {
                      snippet: {
                        title: 'Video Title',
                        description: 'Video Description',
                      },
                    },
                  ],
                },
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<YoutubeService>(YoutubeService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('getVideoInfo', () => {
    it('should return video information', async () => {
      const url = 'https://www.youtube.com/watch?v=VIDEO_ID';
      const expectedInfo = {
        videoId: 'VIDEO_ID',
        title: 'Video Title',
        description: 'Video Description',
      };

      const info = await service.getVideoInfo(url);

      expect(configService.get).toHaveBeenCalledWith('YOUTUBE_API_KEY');
      expect(httpService.axiosRef.get).toHaveBeenCalledWith(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=VIDEO_ID&key=YOUR_YOUTUBE_API_KEY`,
      );
      expect(info).toEqual(expectedInfo);
    });
  });
});
