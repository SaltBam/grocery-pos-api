import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from '../../user/user.schema';

@Schema({ timestamps: true })
export class Adjustment {
    @Prop({
        type: String,
        required: true,
        maxLength: 300,
        trim: true,
    })
    description!: string;

    @Prop({
        required: true,
        type: mongoose.Schema.ObjectId,
        ref: User.name,
        index: true,
    })
    adjustedBy!: User | Types.ObjectId;
}

export const AdjustmentSchema = SchemaFactory.createForClass(Adjustment);
