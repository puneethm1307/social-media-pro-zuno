/**
 * Users controller for user-related endpoints.
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    const userDoc = await this.usersService.findById(user.sub);
    if (!userDoc) {
      return null;
    }
    const { password, ...result } = userDoc.toObject();
    return result;
  }
}

