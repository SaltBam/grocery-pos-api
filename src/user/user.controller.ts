import { Body, Controller, Get, Logger, Patch, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateBulkDto, UpdateBulkDto } from './types/user.dto';
import { Roles } from 'src/auth/auth.decorator';
import { CurrentUser, Role } from 'src/auth/types';
import type { AuthUser } from 'src/auth/types';
import { BaseResponse } from 'src/common/base/base.response';

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
