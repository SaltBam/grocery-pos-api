import { Transform, Type } from "class-transformer"
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateNested } from "class-validator"
import { Category } from "./product.types";
import { Logger } from "@nestjs/common";

export class EnsureValidDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    EAN: string

    @IsOptional()
    @IsString()
    @MaxLength(50)
    name: string

    @IsOptional()
    @IsBoolean()
    @Transform(({ obj, key }) => {
      // Access the RAW value from the incoming object 
      // before any implicit conversion messes with it
      const rawValue = obj[key]; 
      
      if (rawValue === 'true' || rawValue === true) return true;
      if (rawValue === 'false' || rawValue === false) return false;
      
      // Return the raw value for anything else so @IsBoolean can catch bad data
      return rawValue; 
    })
    autoGenerateEAN: boolean
}

export class NewProductFields {
    @IsOptional()
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


export class MatchesDto {
    @IsOptional()
    @IsString()
    EAN: string

    @IsOptional()
    @IsOptional()
    name: string
}