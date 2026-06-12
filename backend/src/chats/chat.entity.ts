import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: true, length: 120 })
  title: string;

  @Column('jsonb', { default: [] })
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
