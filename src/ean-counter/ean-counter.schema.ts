import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class EANCounter {
    @Prop({
        type: String,
        required: true,
        default: 'EAN_COUNTER_ID',
    })
    _id: string;

    @Prop({
        type: Number,
        required: true,
        default: 0,
    })
    counter: number;

    @Prop({
        type: Number,
        required: true,
        default: 200,
    })
    prefix: number;
}

export const EANCounterSchema = SchemaFactory.createForClass(EANCounter);