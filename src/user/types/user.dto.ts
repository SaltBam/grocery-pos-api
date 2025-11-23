import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { Role } from "src/auth/types";


export class CreateReq {
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

class UpdateManyFields {
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

export class UpdateManyReq {
    @IsMongoId()
    @Transform(({ value }) => new Types.ObjectId(value))
    _id: Types.ObjectId;
    
    @ValidateNested()
    @Type(() => UpdateManyFields)
    update: UpdateManyFields;
}

