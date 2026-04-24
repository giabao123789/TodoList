import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtUserPayload,
} from '../common/decorators/current-user.decorator';
import { ChatsService } from './chats.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@ApiTags('chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Throttle({ default: { limit: 40, ttl: 60_000 } })
@Controller('chats')
export class ChatsController {
  constructor(private readonly chats: ChatsService) {}

  @Get()
  list(@CurrentUser() user: JwtUserPayload) {
    return this.chats.list(user.sub);
  }

  @Post()
  post(@CurrentUser() user: JwtUserPayload, @Body() dto: CreateChatMessageDto) {
    return this.chats.sendMessage(user.sub, dto);
  }
}
