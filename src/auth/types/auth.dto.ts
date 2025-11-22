import { Transform } from "class-transformer"
import { IsNotEmpty, IsString, MaxLength } from "class-validator"

export class LoginReq {
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    @Transform(({value}) => value.trim())
    username: string
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    password: string
}