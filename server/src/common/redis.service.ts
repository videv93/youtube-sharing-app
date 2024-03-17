import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  addToSet(key: string, value: string) {
    const redisClient = (
      this.cacheManager.store as unknown as RedisStore
    ).getClient();
    return redisClient.sAdd(key, value);
  }

  removeFromSet(key: string, value: string) {
    const redisClient = (
      this.cacheManager.store as unknown as RedisStore
    ).getClient();
    return redisClient.sRem(key, value);
  }

  isMember(key: string, value: string) {
    const redisClient = (
      this.cacheManager.store as unknown as RedisStore
    ).getClient();
    return redisClient.sIsMember(key, value);
  }

  countMembers(key: string) {
    const redisClient = (
      this.cacheManager.store as unknown as RedisStore
    ).getClient();
    return redisClient.sCard(key);
  }
}
