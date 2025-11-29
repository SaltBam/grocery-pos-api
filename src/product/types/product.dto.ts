import { Transform, Type } from "class-transformer"
import { ArrayNotEmpty, IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator"
import { Types } from "mongoose"

class UpdateFields {
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
class UpdateBulkFields {
    @IsNotEmpty()
    @Transform(({value}) => new Types.ObjectId(value))
    _id: Types.ObjectId
    
    @ValidateNested()
    @Type(() => UpdateFields)
    update: UpdateFields
}
export class UpdateBulkDto {
    @ValidateNested({each: true})
    @Type(() => UpdateBulkFields)
    @IsArray()
    @ArrayNotEmpty()
    updates: UpdateBulkFields[]
}