import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../auth/types/auth.types';
import { STRING_LIMITS } from '../constants';

@Schema()
export class User {
    @Prop({
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        maxlength: STRING_LIMITS.USERNAME,
        trim: true,
    })
    name!: string;

    @Prop({
        type: [String],
        enum: Role,
        required: true,
    })
    roles!: Role[];

    @Prop({
        type: String,
        required: true,
    })
    passwordHash!: string;

    @Prop({
        type: Boolean,
        index: true,
        required: true,
        default: true,
    })
    isActive!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ name: 1, isActive: 1 });
