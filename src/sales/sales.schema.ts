import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { User } from "../user/user.schema";
import { PaymentType } from "./types";

@Schema({ timestamps: true })
export class Sales {
    @Prop({
        min: 0,
        required: true,
    })
    amount: number;

    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name
    })
    cashier: User | Types.ObjectId;

    @Prop({
        required: true,
        enum: Object.values(PaymentType),
        type: String,
        index: true,
    })
    paymentType: PaymentType;

    @Prop({
        maxLength: 50
    })
    referenceNumber?: string;
}

export const SalesSchema = SchemaFactory.createForClass(Sales);