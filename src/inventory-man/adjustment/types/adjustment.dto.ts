import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, NotEquals, ValidateNested } from "class-validator";
import { Types } from "mongoose";

export class GetDetailsDto {
    @IsNotEmpty()
    @Transform(({value}) => new Types.ObjectId(value))
    adjustment: Types.ObjectId;
}

class AdjustFields {
    @IsNotEmpty()
    @Transform(({value}) => new Types.ObjectId(value))
    product: Types.ObjectId;

    @IsNotEmpty()
    @IsNumber()
    @NotEquals(0, { message: 'Change must not be 0' })
    change: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Transform(({value}) => typeof value === "string" ? value.trim() : value)
    reason?: string;
}

export class AdjustDto {
    @IsOptional()
    @IsString()
    @Transform(({value}) => typeof value === "string" ? value.trim() : value)
    description?: string

    @IsNotEmpty()
    @Transform(({value}) => new Types.ObjectId(value))
    adjustedBy: Types.ObjectId;

    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type(() => AdjustFields)
    adjustDetails: AdjustFields[]
}