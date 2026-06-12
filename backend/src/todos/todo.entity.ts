import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TodoPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ default: false })
  completed: boolean;

  @Column({
    type: 'enum',
    enum: TodoPriority,
    default: TodoPriority.Medium,
  })
  priority: TodoPriority;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  deadline: Date | null;

  @Index()
  @Column({ nullable: false })
  userId: string;

  /** Sort order for drag-and-drop (lower = first) */
  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
