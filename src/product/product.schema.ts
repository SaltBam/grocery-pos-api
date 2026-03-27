import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Category } from "./types";

@Schema({ timestamps: true })
export class Product {
    @Prop({
        type: String,
        isRequired: true,
        unique: true,
        index: true,
        maxLength: 50
    })
    EAN: string;

    @Prop({
        type: String,
        isRequired: true,
        unique: true,
        index: true,
        uppercase: true,
        maxLength: 50
    })
    name: string;

    @Prop({
        type: Number,
        isRequired: true,
        min: 0,
    })
    price: number

    @Prop({
        required: false,
        enum: Object.values(Category),
        type: String,
    })
    category: Category;
}

export const ProductSchema = SchemaFactory.createForClass(Product);