import { Body, Controller, Get, Logger, Patch, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateReq, GetAllReq, UpdateManyReq } from './types/user.dto';
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

    @Roles(Role.Owner)
    @Patch('many')
    async updateMany(
        @Body() updateManyReq: UpdateManyReq[]
    ) {
        await this.service.updateMany(updateManyReq);

        return new BaseResponse();
    }

    @Roles(Role.Owner)
    @Post()
    async create( @Body() createReq: CreateReq) {
        await this.service.create(createReq);

        return new BaseResponse();
    }
}
