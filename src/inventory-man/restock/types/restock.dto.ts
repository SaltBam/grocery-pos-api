import { Transform, Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsDate,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { RequiresOne } from '../../../common/validators';
import { NewProductFields } from '../../../product/types';

export class GetDetailsParamDto {
    @IsNotEmpty()
    @IsMongoId()
    restock!: string;
}
export class GetDetailsQueryDto {
    @IsString()
    @IsOptional()
    name!: string;

    @IsString()
    @IsOptional()
    EAN!: string;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    page!: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    limit!: number;
}

export type GetDetailsDto = GetDetailsQueryDto & GetDetailsParamDto;

export class RestockFields {
    @IsOptional()
    @ValidateNested()
    @Type(() => NewProductFields)
    newProduct?: NewProductFields;

    @IsOptional()
    @IsMongoId()
    product?: string;

    @RequiresOne(['newProduct', 'product'])
    dummy?: unknown;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @Min(1)
    @IsInt()
    quantity!: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @Min(0)
    unitCost!: number;
}
export class RestockDto {
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => RestockFields)
    restockDetails!: RestockFields[];

    @IsNotEmpty()
    @IsString()
    @MaxLength(300)
    description!: string;
}

export class GetAllDto {
    @IsMongoId()
    @IsOptional()
    restockedBy!: string;

    @IsArray()
    @IsDate({ each: true })
    @IsOptional()
    @Transform(
        ({ value }) => (Array.isArray(value) ? value : [value]) as unknown[],
    )
    @Type(() => Date)
    dateRange!: Date[];

    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    page!: number;

    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    limit!: number;
}
