import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { User } from "src/user/user.schema";

enum PaymentType {
    GCASH = 'GCASH',
    CASH = 'CASH'
}

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
    })
    paymentType: PaymentType;

    @Prop()
    referenceNumber?: string;
}

export const SalesSchema = SchemaFactory.createForClass(Sales);