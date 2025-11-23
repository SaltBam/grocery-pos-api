import { Transform, Type } from "class-transformer"
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator"
import { Types } from "mongoose"

class UpdateManyFields {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Transform(({value}) => value.trim())
    @IsNotEmpty()
    name?: string

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number
}

export class UpdateManyReq {
    @IsMongoId()
    @Transform(({value}) => new Types.ObjectId(value))
    _id: Types.ObjectId

    @ValidateNested()
    @Type(() => UpdateManyFields)
    update: UpdateManyFields
}

