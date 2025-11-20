import { Body, Controller, Get, Logger, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { GetAllReq } from './types/user.dto';
import { Roles } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/types';
import { BaseResponse } from 'src/common/base/base.response';

@Controller('user')
export class UserController {
    constructor(
        private service: UserService,
    ) 
    {}

    @Roles(Role.Owner)
    @Get('all')
    async getAll() {
        const data = await this.service.getAll();

        return new BaseResponse(data);
    }

}
