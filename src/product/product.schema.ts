import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
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
}

export const ProductSchema = SchemaFactory.createForClass(Product);