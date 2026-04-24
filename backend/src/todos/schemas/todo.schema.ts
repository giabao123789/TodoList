import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

export enum TodoPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Todo {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({
    type: String,
    enum: TodoPriority,
    default: TodoPriority.Medium,
  })
  priority: TodoPriority;

  @Prop({ type: Date, default: null })
  deadline: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /** Sort order for drag-and-drop (lower = first) */
  @Prop({ type: Number, default: 0 })
  order: number;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);

TodoSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    const o = ret as unknown as Record<string, unknown>;
    o.id = (o._id as { toString: () => string })?.toString?.();
    delete o._id;
    delete o.__v;
    return o;
  },
});
