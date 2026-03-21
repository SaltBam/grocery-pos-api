import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, NotEquals, ValidateNested } from "class-validator";
import { Types } from "mongoose";

export class GetDetailsDto {
    @IsNotEmpty()
    @IsMongoId()
    adjustment: string;
}

class AdjustFields {
    @IsNotEmpty()
    @IsMongoId()
    product: string;

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

    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type(() => AdjustFields)
    adjustDetails: AdjustFields[]
}

export class GetAllDto {
    @IsNumber()
    @IsPositive()
    limit: number
    
    @IsNumber()
    @IsPositive()
    page: number
}