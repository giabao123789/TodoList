import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto, TodoFilter } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './todo.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo) private readonly repo: Repository<Todo>,
  ) {}

  async create(userId: string, dto: CreateTodoDto) {
    // compute next order
    const maxRow = await this.repo
      .createQueryBuilder('t')
      .select('MAX(t.order)', 'max')
      .where('t.userId = :userId', { userId })
      .getRawOne<{ max: number | null }>();
    const nextOrder = dto.order ?? (maxRow?.max != null ? maxRow.max + 1 : 0);

    const todo = this.repo.create({
      title: dto.title,
      completed: dto.completed ?? false,
      priority: dto.priority,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      userId,
      order: nextOrder,
    });
    return this.repo.save(todo);
  }

  async findAll(userId: string, query: QueryTodosDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = { userId };
    if (query.filter === TodoFilter.Completed) {
      where.completed = true;
    } else if (query.filter === TodoFilter.Pending) {
      where.completed = false;
    }
    if (query.search?.trim()) {
      where.title = ILike(`%${query.search.trim()}%`);
    }

    const [items, total] = await this.repo.findAndCount({
      where: where as any,
      order: { order: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(userId: string, id: string) {
    const todo = await this.repo.findOne({ where: { id } });
    if (!todo || todo.userId !== userId) {
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }

  async update(userId: string, id: string, dto: UpdateTodoDto) {
    const todo = await this.findOne(userId, id);
    if (dto.title !== undefined) todo.title = dto.title;
    if (dto.completed !== undefined) todo.completed = dto.completed;
    if (dto.priority !== undefined) todo.priority = dto.priority;
    if (dto.deadline !== undefined) {
      todo.deadline = dto.deadline ? new Date(dto.deadline) : null;
    }
    if (dto.order !== undefined) todo.order = dto.order;
    return this.repo.save(todo);
  }

  async remove(userId: string, id: string) {
    const todo = await this.findOne(userId, id);
    await this.repo.remove(todo);
    return { success: true };
  }

  async reorder(userId: string, orderedIds: string[]) {
    // verify all ids belong to user
    const count = await this.repo.count({
      where: { userId, id: In(orderedIds) },
    });
    if (count !== orderedIds.length) {
      throw new BadRequestException(
        'All todo ids must exist and belong to you',
      );
    }
    await Promise.all(
      orderedIds.map((id, index) =>
        this.repo.update({ id, userId }, { order: index }),
      ),
    );
    return { success: true };
  }
}
