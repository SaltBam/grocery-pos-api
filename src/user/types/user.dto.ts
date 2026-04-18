import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { Role } from "../../auth/types";

class CreateFields {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    name: string
    
    @IsString()
    @IsNotEmpty()
    password: string
    
    @IsEnum(Role, { each: true })
    @ArrayNotEmpty()
    roles: Role[]
}
export class CreateBulkDto {
    @ValidateNested({each: true})
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => CreateFields)
    users: CreateFields[]
}
class UpdateFields {
    @IsOptional()
    @IsString()
    @Transform(({value}) => value.trim())
    name?: string;
    
    @IsOptional()
    @IsString()
    password?: string;
    
    @IsOptional()
    @IsArray()
    roles?: Role[];
    
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
class UpdateBulkFields {
    @IsNotEmpty()
    @IsMongoId()
    user: string;
    
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => UpdateFields)
    update: UpdateFields;
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
    
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    page: number
    
    @IsPositive()
    @IsNumber()
    @IsNotEmpty()
    limit: number
}