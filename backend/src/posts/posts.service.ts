/**
 * Posts service for post management operations.
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string): Promise<PostDocument> {
    const post = new this.postModel({
      ...createPostDto,
      authorId: new Types.ObjectId(authorId),
    });
    const savedPost = await post.save();
    
    // Invalidate feed cache
    await this.invalidateFeedCache();
    
    return savedPost;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PostDocument[]> {
    const skip = (page - 1) * limit;
    
    // Try to get from cache
    const cacheKey = `feed:page:${page}:limit:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const posts = await this.postModel
      .find()
      .populate('authorId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Cache for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(posts.map(p => p.toObject())));

    return posts;
  }

  async findOne(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).populate('authorId', 'username displayName avatar').exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findByAuthor(authorId: string, page: number = 1, limit: number = 10): Promise<PostDocument[]> {
    const skip = (page - 1) * limit;
    return this.postModel
      .find({ authorId: new Types.ObjectId(authorId) })
      .populate('authorId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string, userRole: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check ownership or admin
    if (post.authorId.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only update your own posts');
    }

    Object.assign(post, updatePostDto);
    const updated = await post.save();
    
    // Invalidate cache
    await this.invalidateFeedCache();
    
    return updated;
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check ownership or admin
    if (post.authorId.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postModel.findByIdAndDelete(id).exec();
    
    // Invalidate cache
    await this.invalidateFeedCache();
  }

  async likePost(id: string, userId: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userIdObj = new Types.ObjectId(userId);
    const isLiked = post.likedBy.some(id => id.toString() === userId);

    if (isLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Like
      post.likedBy.push(userIdObj);
      post.likesCount += 1;
    }

    return post.save();
  }

  async search(query: string, page: number = 1, limit: number = 10): Promise<PostDocument[]> {
    const skip = (page - 1) * limit;
    return this.postModel
      .find({ $text: { $search: query } })
      .populate('authorId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  private async invalidateFeedCache(): Promise<void> {
    // Invalidate all feed cache keys (simple approach)
    const keys = await this.redis.keys('feed:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

