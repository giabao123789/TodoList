import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { DeadlineDto } from './dto/deadline.dto';
import { GenerateTodosDto } from './dto/generate-todos.dto';
import { PriorityDto } from './dto/priority.dto';
import { SuggestDto } from './dto/suggest.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Throttle({ default: { limit: 25, ttl: 60_000 } })
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('generate-todos')
  generateTodos(@Body() dto: GenerateTodosDto) {
    return this.ai.generateTodos(dto);
  }

  @Post('suggest')
  suggest(@Body() dto: SuggestDto) {
    return this.ai.suggestNext(dto);
  }

  @Post('priority')
  priority(@Body() dto: PriorityDto) {
    return this.ai.classifyPriority(dto);
  }

  @Post('deadline')
  deadline(@Body() dto: DeadlineDto) {
    return this.ai.suggestDeadline(dto);
  }
}
