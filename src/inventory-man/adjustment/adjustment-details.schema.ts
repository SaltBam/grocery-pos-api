import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { Adjustment } from "./adjustment.schema";
import { Product } from "src/product/product.schema";

@Schema()
export class AdjustmentDetails {
    @Prop({
        required: true,
        type: mongoose.Schema.ObjectId,
        ref: Adjustment.name
    })
    adjustment: Adjustment | Types.ObjectId;

    @Prop({
        required: true,
        type: mongoose.Schema.ObjectId,
        ref: Product.name
    })
    product: Product | Types.ObjectId;

    @Prop({
        required: true,
        validate: [
            {
                validator: Number.isInteger,
                message: 'Change must be an integer'
            },
            {
                validator: (value: number) => value !== 0,
                message: 'Change must not be 0'
            }
        ]
    })
    change: number

    @Prop({
        required: false,
        maxLength: 100,
        trim: true
    })
    reason?: string
}

export const AdjustmentDetailsSchema = SchemaFactory.createForClass(AdjustmentDetails);