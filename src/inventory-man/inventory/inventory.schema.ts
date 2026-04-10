import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { Product } from "src/product/product.schema";
import { User } from "src/user/user.schema";

@Schema({ timestamps: true })
export class Inventory {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Product.name,
        required: true,
        unique: true,
        index: true
    })
    product: Product | Types.ObjectId

    @Prop({
        required: true,
        min: 0,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: `Stock must be an integer`
        }
    })
    stock: number

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        required: true,
        index: true,
    })
    updatedBy: User | Types.ObjectId
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);