/**
 * DTO for creating a new post.
 */

import { IsString, IsArray, IsOptional, MaxLength, ArrayMaxSize } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(2000)
  caption: string;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  mediaUrls: string[];
}

