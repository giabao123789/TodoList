import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    const o = ret as unknown as Record<string, unknown>;
    o.id = (o._id as { toString: () => string })?.toString?.();
    delete o._id;
    delete o.__v;
    delete o.password;
    return o;
  },
});
