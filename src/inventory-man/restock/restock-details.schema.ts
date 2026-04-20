import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { Product } from "../../product/product.schema";
import { Restock } from "./restock.schema";

@Schema()
export class RestockDetails {
    @Prop({
        required: true,
        type: mongoose.Schema.ObjectId,
        ref: Restock.name,
        index: true,
    })
    restock: Types.ObjectId

    @Prop({
        required: true,
        type: mongoose.Schema.ObjectId,
        ref: Product.name,
        index: true,
    })
    product: Product | Types.ObjectId

    @Prop({
        type: Number,
        required: true,
        min: 0
    })
    quantity: number

    @Prop({
        type: Number,
        required: true,
        min: 0
    })
    unitCost: number
}

export const RestockDetailsSchema = SchemaFactory.createForClass(RestockDetails);