import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { Role } from "src/auth/types";

export class GetAllReq {
    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true })
    @Transform(({ value }) => value.map((_id: string) => new Types.ObjectId(_id)))
    ids: Types.ObjectId[]
}

export class CreateReq {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    password: string

    @IsEnum(Role, { each: true })
    @ArrayNotEmpty()
    roles: Role[]
}

class UpdateManyFields {
    @IsOptional()
    @IsString()
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

