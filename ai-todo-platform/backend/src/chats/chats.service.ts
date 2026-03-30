import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiService } from '../ai/ai.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { Chat, ChatDocument } from './schemas/chat.schema';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    private readonly ai: AiService,
  ) {}

  async list(userId: string) {
    return this.chatModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()
      .exec();
  }

  async sendMessage(userId: string, dto: CreateChatMessageDto) {
    const uid = new Types.ObjectId(userId);
    let chat: ChatDocument | null = null;

    if (dto.chatId) {
      chat = await this.chatModel.findOne({ _id: dto.chatId, userId: uid });
      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
    } else {
      chat = await this.chatModel.create({
        userId: uid,
        title: dto.message.slice(0, 80),
        messages: [],
      });
    }

    const userMsg = {
      role: 'user' as const,
      content: dto.message,
      createdAt: new Date(),
    };
    chat.messages.push(userMsg);
    if (!chat.title || chat.title.length < 3) {
      chat.title = dto.message.slice(0, 80);
    }

    const history = chat.messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const reply = await this.ai.chatAssistant(history);

    chat.messages.push({
      role: 'assistant',
      content: reply,
      createdAt: new Date(),
    });
    await chat.save();

    return {
      chatId: chat.id,
      reply,
      messages: chat.messages,
    };
  }
}
