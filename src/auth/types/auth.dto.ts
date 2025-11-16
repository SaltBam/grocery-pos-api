import { IsNotEmpty, IsString, MaxLength } from "class-validator"

export class LoginReq {
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    username: string
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    password: string
}