import { Body, Controller, Get, Logger, Patch, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateBulkDto, UpdateBulkDto } from './types/user.dto';
import { Roles } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/types';
import { BaseResponse } from 'src/common/base/base.response';

@Controller('users')
export class UserController {
    constructor(
        private service: UserService,
    ) 
    {}

    @Roles(Role.Owner)
    @Get()
    async get() {
        const data = await this.service.get();

        return new BaseResponse(data);
    }

    @Roles(Role.Owner)
    @Patch()
    async update(
        @Body() dto: UpdateBulkDto
    ) {
        await this.service.update(dto);

        return new BaseResponse();
    }

    @Roles(Role.Owner)
    @Post()
    async create(@Body() dto: CreateBulkDto) {
        await this.service.create(dto);

        return new BaseResponse();
    }
}
