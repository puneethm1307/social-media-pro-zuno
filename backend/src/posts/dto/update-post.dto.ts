/**
 * DTO for updating a post.
 */

import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  caption?: string;
}

