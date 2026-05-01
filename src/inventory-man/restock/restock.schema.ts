import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from '../../user/user.schema';

@Schema({ timestamps: true })
export class Restock {
    @Prop({
        type: String,
        required: true,
        maxLength: 300,
        trim: true,
    })
    description!: string;

    @Prop({
        type: mongoose.Schema.ObjectId,
        ref: User.name,
        required: true,
        index: true,
    })
    restockedBy!: User | Types.ObjectId;

    @Prop({
        type: Number,
        required: true,
        min: 0,
    })
    totalCost!: number;
}

export const RestockSchema = SchemaFactory.createForClass(Restock);
