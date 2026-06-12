import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { Chat } from './chat.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly repo: Repository<Chat>,
    private readonly ai: AiService,
  ) {}

  async list(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  async sendMessage(userId: string, dto: CreateChatMessageDto) {
    let chat: Chat | null = null;

    if (dto.chatId) {
      chat = await this.repo.findOne({ where: { id: dto.chatId, userId } });
      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
    } else {
      chat = this.repo.create({
        userId,
        title: dto.message.slice(0, 80),
        messages: [],
      });
      chat = await this.repo.save(chat);
    }

    const userMsg = {
      role: 'user' as const,
      content: dto.message,
      createdAt: new Date(),
    };
    chat.messages = [...chat.messages, userMsg];
    if (!chat.title || chat.title.length < 3) {
      chat.title = dto.message.slice(0, 80);
    }

    const history = chat.messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const reply = await this.ai.chatAssistant(history);

    chat.messages = [
      ...chat.messages,
      {
        role: 'assistant',
        content: reply,
        createdAt: new Date(),
      },
    ];
    await this.repo.save(chat);

    return {
      chatId: chat.id,
      reply,
      messages: chat.messages,
    };
  }
}
