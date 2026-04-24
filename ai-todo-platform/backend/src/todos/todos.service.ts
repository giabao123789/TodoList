import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto, TodoFilter } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoDocument } from './schemas/todo.schema';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
  ) {}

  async create(userId: string, dto: CreateTodoDto) {
    const maxOrder = await this.todoModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ order: -1 })
      .select('order')
      .lean()
      .exec();
    const nextOrder =
      dto.order ?? (maxOrder ? (maxOrder as any).order + 1 : 0);
    return this.todoModel.create({
      title: dto.title,
      completed: dto.completed ?? false,
      priority: dto.priority,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      userId: new Types.ObjectId(userId),
      order: nextOrder,
    });
  }

  async findAll(userId: string, query: QueryTodosDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (query.filter === TodoFilter.Completed) {
      filter.completed = true;
    } else if (query.filter === TodoFilter.Pending) {
      filter.completed = false;
    }
    if (query.search?.trim()) {
      filter.title = { $regex: query.search.trim(), $options: 'i' };
    }
    const [items, total] = await Promise.all([
      this.todoModel
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.todoModel.countDocuments(filter).exec(),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(userId: string, id: string) {
    const todo = await this.todoModel.findById(id).exec();
    if (!todo || todo.userId.toString() !== userId) {
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
    return todo.save();
  }

  async remove(userId: string, id: string) {
    const todo = await this.findOne(userId, id);
    await todo.deleteOne();
    return { success: true };
  }

  async reorder(userId: string, orderedIds: string[]) {
    const objectUserId = new Types.ObjectId(userId);
    const ids = orderedIds.map((id) => new Types.ObjectId(id));
    const count = await this.todoModel.countDocuments({
      userId: objectUserId,
      _id: { $in: ids },
    });
    if (count !== orderedIds.length) {
      throw new BadRequestException(
        'All todo ids must exist and belong to you',
      );
    }
    await Promise.all(
      orderedIds.map((id, index) =>
        this.todoModel.updateOne(
          { _id: id, userId: objectUserId },
          { $set: { order: index } },
        ),
      ),
    );
    return { success: true };
  }
}
