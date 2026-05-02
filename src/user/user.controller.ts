import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateBulkDto, UpdateBulkDto } from './types/user.dto';
import { Roles } from '../auth/auth.decorator';
import { CurrentUser, Role } from '../auth/types';
import type { AuthUser } from '../auth/types';
import { GetAllDto } from '../product/types';

@Roles(Role.Owner)
@Controller('users')
export class UserController {
    constructor(private service: UserService) {}

    @Roles(Role.Cashier, Role.Owner, Role.InventoryManager)
    @Get('/profile')
    getProfile(@CurrentUser() user: AuthUser) {
        return {
            username: user.username,
            roles: user.roles,
        };
    }

    @Roles(Role.Owner)
    @Get()
    async getAll(@Query() dto: GetAllDto) {
        const data = await this.service.getAll(dto);
        return data;
    }

    @Roles(Role.Owner)
    @Patch()
    async update(@Body() dto: UpdateBulkDto) {
        await this.service.update(dto);
    }

    @Roles(Role.Owner)
    @Post()
    async create(@Body() dto: CreateBulkDto) {
        await this.service.create(dto);
    }
}
