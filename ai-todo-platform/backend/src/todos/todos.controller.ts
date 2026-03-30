import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUserPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto } from './dto/query-todos.dto';
import { ReorderTodosDto } from './dto/reorder-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';

@ApiTags('todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  list(@CurrentUser('sub') userId: string, @Query() query: QueryTodosDto) {
    return this.todos.findAll(userId, query);
  }

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateTodoDto) {
    return this.todos.create(userId, dto);
  }

  @Patch('reorder')
  reorder(@CurrentUser('sub') userId: string, @Body() dto: ReorderTodosDto) {
    return this.todos.reorder(userId, dto.orderedIds);
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todos.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.todos.remove(userId, id);
  }
}
