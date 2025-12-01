import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { Types } from "mongoose";

export class GetDetailsDto {
    @IsNotEmpty()
    @Transform(({value}) => new Types.ObjectId(value))
    restock: Types.ObjectId
}
class RestockFields {
    @IsNotEmpty()
    @Transform(({value}) => new Types.ObjectId(value))
    product: Types.ObjectId;
    
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @IsInt()
    quantity: number;
    
    @IsNumber()
    @IsNotEmpty()
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