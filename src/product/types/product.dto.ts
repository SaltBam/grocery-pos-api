import { Transform, Type } from "class-transformer"
import { ArrayNotEmpty, IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator"

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

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    price: number
}

export class NewProductDto {
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