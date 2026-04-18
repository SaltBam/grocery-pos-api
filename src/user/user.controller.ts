import { Body, Controller, Get, Logger, Patch, Post, Query, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateBulkDto, UpdateBulkDto } from './types/user.dto';
import { Roles } from '../auth/auth.decorator';
import { CurrentUser, Role } from '../auth/types';
import type { AuthUser } from '../auth/types';
import { BaseResponse } from '../common/base/base.response';
import { GetAllDto } from '../product/types';

@Roles(Role.Owner)
@Controller('users')
export class UserController {
    constructor(
        private service: UserService,
    ) 
    {}

    @Roles(Role.Cashier, Role.Owner, Role.InventoryManager)
    @Get('/profile')
    getProfile(@CurrentUser() user: AuthUser) {
        return new BaseResponse({
            username: user.username,
            roles: user.roles
        })
    }

    @Roles(Role.Owner)
    @Get()
    async getAll(@Query() dto: GetAllDto) {
        const data = await this.service.getAll(dto);

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
