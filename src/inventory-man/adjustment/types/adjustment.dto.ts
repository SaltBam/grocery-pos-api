import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, NotEquals, ValidateNested } from "class-validator";
import { Types } from "mongoose";

export class GetDetailsParamDto {
    @IsNotEmpty()
    @IsMongoId()
    adjustment: string;
}

export class GetDetailsQueryDto {
    @IsString()
    @IsOptional()
    name: string
    
    @IsString()
    @IsOptional()
    EAN: string

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    page: number

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    limit: number
}

export type GetDetailsDto = GetDetailsQueryDto & GetDetailsParamDto


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
    @IsNotEmpty()
    @IsString()
    @Transform(({value}) => typeof value === "string" ? value.trim() : value)
    description: string

    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type(() => AdjustFields)
    adjustDetails: AdjustFields[]
}

export class GetAllDto {
    @IsMongoId()
    @IsOptional()
    adjustedBy: string
    
    @IsArray()
    @IsDate({ each: true, })
    @IsOptional()
    @Transform(({value}) => (Array.isArray(value) ? value : [value]))
    @Type(() => Date)
    dateRange: Date[]

    @IsNumber()
    @IsPositive()
    limit: number
    
    @IsNumber()
    @IsPositive()
    page: number
}