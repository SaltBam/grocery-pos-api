import { Transform, Type } from "class-transformer";
import { ArrayNotContains, ArrayNotEmpty, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { PaymentType } from "./sales.types";

class SellDetailsFields {
    @IsNotEmpty()
    @Transform(({value}) => new Types.ObjectId(value))
    product: Types.ObjectId;
    
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    quantity: number;
}

export class SellDto {
    @IsNotEmpty()
    @Transform(({value}) => new Types.ObjectId(value))
    cashier: Types.ObjectId;
    
    @IsNotEmpty()
    @IsEnum(PaymentType)
    paymentType: PaymentType;
    
    @IsOptional()
    @IsString()
    @MaxLength(50)
    referenceNumber?: string;

    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => SellDetailsFields)
    sellDetails: SellDetailsFields[]
}

export class ReceiptFields {
    productName: string
    quantity: number
    amount: number
}

export class ReceiptDto {
    cashierName: string;
    items: ReceiptFields[];
    totalAmount: number;
}