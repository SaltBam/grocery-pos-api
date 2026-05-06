import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Category } from './types';

@Schema({ timestamps: true })
export class Product {
    @Prop({
        type: String,
        required: true,
        unique: true,
        maxLength: 13,
    })
    EAN!: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        maxLength: 50,
    })
    name!: string;

    @Prop({
        type: Number,
        required: true,
        min: 0,
    })
    price!: number;

    @Prop({
        required: false,
        enum: Object.values(Category),
        type: String,
    })
    category!: Category;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
