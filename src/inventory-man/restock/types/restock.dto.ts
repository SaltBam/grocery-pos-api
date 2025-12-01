import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, min, Min, ValidateNested } from "class-validator";
import { RequiresOne } from "src/common/validators";
import { NewProductFields } from "src/product/types";

export class GetDetailsDto {
    @IsNotEmpty()
    @IsMongoId()
    restock: string
}

export class RestockFields {
    @IsOptional()
    @ValidateNested()
    @Type(() => NewProductFields)
    newProduct?: NewProductFields;

    @IsOptional()
    @IsMongoId()
    product?: string

    @RequiresOne(['newProduct', 'product'])
    dummy?: any

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @Min(1)
    @IsInt()
    quantity: number;
    
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @Min(0)
    unitCost: number;
}
export class RestockDto {
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => RestockFields)
    restockDetails: RestockFields[];

    @IsOptional()
    @IsString()
    @MaxLength(300)
    description?: string;
}