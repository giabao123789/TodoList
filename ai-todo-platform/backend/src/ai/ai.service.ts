import {
  BadGatewayException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TodoPriority } from '../todos/schemas/todo.schema';
import { DeadlineDto } from './dto/deadline.dto';
import { GenerateTodosDto } from './dto/generate-todos.dto';
import { PriorityDto } from './dto/priority.dto';
import { SuggestDto } from './dto/suggest.dto';

@Injectable()
export class AiService {
  private readonly openai: OpenAI | null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('OPENAI_API_KEY');
    this.model = this.config.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
    this.openai = key ? new OpenAI({ apiKey: key }) : null;
  }

  private ensureClient(): OpenAI {
    if (!this.openai) {
      throw new ServiceUnavailableException(
        'AI is not configured. Set OPENAI_API_KEY.',
      );
    }
    return this.openai;
  }

  private async jsonCompletion<T>(
    system: string,
    user: string,
    schemaHint: string,
    maxTokens = 350,
  ): Promise<T> {
    const client = this.ensureClient();
    try {
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: `${user}\n\nRespond ONLY with valid JSON matching: ${schemaHint}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: maxTokens,
      });
      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new ServiceUnavailableException('Empty AI response');
      }
      try {
        return JSON.parse(raw) as T;
      } catch {
        throw new ServiceUnavailableException('Invalid JSON from AI');
      }
    } catch (err: unknown) {
      const status =
        (err as { status?: number; statusCode?: number })?.status ??
        (err as { status?: number; statusCode?: number })?.statusCode;
      const errMsg = (err as { message?: string })?.message || '';
      if (status === 429) {
        throw new HttpException(
          'AI quota exceeded. Check your OpenAI plan/billing and try again later.',
          429,
        );
      }
      if (status !== 429 && errMsg.toLowerCase().includes('quota')) {
        throw new HttpException(
          'AI quota exceeded. Check your OpenAI plan/billing and try again later.',
          429,
        );
      }
      throw new BadGatewayException('AI request failed. Try again later.');
    }
  }

  async generateTodos(dto: GenerateTodosDto) {
    const data = await this.jsonCompletion<{
      todos: { title: string; day?: number; priority?: string }[];
    }>(
      'You break goals into short actionable tasks. Be concise. Return at most 7 todos. Day must be 1..7. Priority must be one of: high, medium, low.',
      `Break this goal into actionable daily tasks (or sequential steps): "${dto.goal}".`,
      '{"todos":[{"title":"string","day":1,"priority":"high|medium|low"}]}',
      450,
    );
    return {
      todos: (data.todos || []).map((t) => ({
        title: t.title,
        day: t.day,
        priority: normalizePriority(t.priority),
      })),
    };
  }

  async suggestNext(dto: SuggestDto) {
    const data = await this.jsonCompletion<{ suggestion: string; reason?: string }>(
      'You are a productivity coach. Suggest ONE concrete next action.',
      `Current task title: "${dto.title}". ${dto.context ? `Context: ${dto.context}` : ''}`,
      '{"suggestion":"string","reason":"string"}',
      220,
    );
    return {
      suggestion: data.suggestion || 'Take the next small step on this task.',
      reason: data.reason,
    };
  }

  async classifyPriority(dto: PriorityDto) {
    const data = await this.jsonCompletion<{ priority: string; rationale?: string }>(
      'Classify task priority as exactly one of: high, medium, low.',
      `Task: "${dto.title}"`,
      '{"priority":"high|medium|low","rationale":"string"}',
      160,
    );
    return {
      priority: normalizePriority(data.priority),
      rationale: data.rationale,
    };
  }

  async chatAssistant(
    history: { role: 'user' | 'assistant' | 'system'; content: string }[],
  ) {
    const client = this.ensureClient();
    try {
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly productivity coach. Give short, practical advice about tasks, focus, and habits.',
          },
          ...history,
        ],
        temperature: 0.5,
        max_tokens: 220,
      });
      return completion.choices[0]?.message?.content?.trim() || '';
    } catch (err: unknown) {
      const status =
        (err as { status?: number; statusCode?: number })?.status ??
        (err as { status?: number; statusCode?: number })?.statusCode;
      const errMsg = (err as { message?: string })?.message || '';
      if (status === 429) {
        throw new HttpException(
          'AI quota exceeded. Check your OpenAI plan/billing and try again later.',
          429,
        );
      }
      if (status !== 429 && errMsg.toLowerCase().includes('quota')) {
        throw new HttpException(
          'AI quota exceeded. Check your OpenAI plan/billing and try again later.',
          429,
        );
      }
      throw new BadGatewayException('AI request failed. Try again later.');
    }
  }

  async suggestDeadline(dto: DeadlineDto) {
    const data = await this.jsonCompletion<{
      deadline: string;
      confidence?: string;
    }>(
      'Suggest a realistic ISO-8601 deadline (date only or datetime) for the task.',
      `Task: "${dto.title}". ${dto.existingDeadline ? `User deadline hint: ${dto.existingDeadline}` : ''} Today is reference for planning.`,
      '{"deadline":"2026-03-30","confidence":"string"}',
      220,
    );
    return {
      deadline: data.deadline,
      confidence: data.confidence,
    };
  }
}

function normalizePriority(p?: string): TodoPriority {
  const v = (p || '').toLowerCase();
  if (v === 'high') return TodoPriority.High;
  if (v === 'low') return TodoPriority.Low;
  return TodoPriority.Medium;
}
