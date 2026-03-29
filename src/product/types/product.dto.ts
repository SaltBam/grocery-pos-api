import { Transform, Type } from "class-transformer"
import { ArrayNotEmpty, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateNested } from "class-validator"
import { Category } from "./product.types";

export class NewProductFields {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    EAN: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string

    @IsOptional()
    @IsEnum(Category, {
        message: `Category must be a valid enum value: ${Object.values(Category).join(', ')}`
    })
    category: Category;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    price: number
}

export class NewProductsDto {
    @ValidateNested({each: true})
    @ArrayNotEmpty()
    newProducts: NewProductFields[]
}
export class GetDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    EAN: string
}
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
    @IsMongoId()
    product: string
    
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

export class GetAllDto {
    @IsString()
    @IsOptional()
    name: string
    
    @IsString()
    @IsOptional()
    EAN:string

    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    page: number
    
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    limit: number
}