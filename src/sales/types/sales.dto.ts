import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsEnum,
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
import { PaymentType } from './sales.types';

export class GetDetailsDto {
    @IsNotEmpty()
    @IsMongoId()
    sale!: string;
}
class SellDetailsFields {
    @IsNotEmpty()
    @IsMongoId()
    product!: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    quantity!: number;
}

export class SellDto {
    @IsNotEmpty()
    @IsEnum(PaymentType)
    paymentType!: PaymentType;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    referenceNumber?: string;

    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => SellDetailsFields)
    sellDetails!: SellDetailsFields[];
}

export class ReceiptFields {
    productName!: string;
    quantity!: number;
    amount!: number;
}

export class ReceiptDto {
    cashierName!: string;
    items!: ReceiptFields[];
    totalAmount!: number;
}

export class GetAllDto {
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    page!: number;

    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    limit!: number;
}
