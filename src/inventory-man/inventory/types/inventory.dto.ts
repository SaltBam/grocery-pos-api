import {
    IsString,
    IsOptional,
    IsPositive,
    IsNumber,
    IsNotEmpty,
} from 'class-validator';

export class GetAllDto {
    @IsOptional()
    @IsNumber()
    maxStock!: number;

    @IsString()
    @IsOptional()
    name!: string;

    @IsString()
    @IsOptional()
    EAN!: string;

    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    page!: number;

    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    limit!: number;
}
