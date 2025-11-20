import { Transform } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class GetAllReq {
    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true })
    @Transform(({ value }) => value.map((_id: string) => new Types.ObjectId(_id)))
    ids: Types.ObjectId[]
}