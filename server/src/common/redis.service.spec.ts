import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
import { Cache } from 'cache-manager';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            store: {
              getClient: vi.fn().mockReturnValue({
                sAdd: vi.fn(),
                sRem: vi.fn(),
                sIsMember: vi.fn(),
                sCard: vi.fn(),
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should add value to set', () => {
    const key = 'testKey';
    const value = 'testValue';

    service.addToSet(key, value);

    const redisClient = (
      cacheManager.store as unknown as RedisStore
    ).getClient();
    expect(redisClient.sAdd).toHaveBeenCalledWith(key, value);
  });

  it('should remove value from set', () => {
    const key = 'testKey';
    const value = 'testValue';

    service.removeFromSet(key, value);

    const redisClient = (
      cacheManager.store as unknown as RedisStore
    ).getClient();
    expect(redisClient.sRem).toHaveBeenCalledWith(key, value);
  });

  it('should check if value is a member of set', () => {
    const key = 'testKey';
    const value = 'testValue';

    service.isMember(key, value);

    const redisClient = (
      cacheManager.store as unknown as RedisStore
    ).getClient();
    expect(redisClient.sIsMember).toHaveBeenCalledWith(key, value);
  });

  it('should count members of set', () => {
    const key = 'testKey';

    service.countMembers(key);

    const redisClient = (
      cacheManager.store as unknown as RedisStore
    ).getClient();
    expect(redisClient.sCard).toHaveBeenCalledWith(key);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
