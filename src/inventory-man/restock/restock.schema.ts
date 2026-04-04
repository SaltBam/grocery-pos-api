import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { User } from "src/user/user.schema";

@Schema({ timestamps: true })
export class Restock {
    @Prop({
        required: true,
        maxLength: 300,
        trim: true,
    })
    description: string

    @Prop({
        type: mongoose.Schema.ObjectId,
        ref: User.name,
        required: true,
    })
    restockedBy: User | Types.ObjectId

    @Prop({
        required: true,
        min: 0
    })
    totalCost: number
}

export const RestockSchema = SchemaFactory.createForClass(Restock);