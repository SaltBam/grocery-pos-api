import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RestockService } from './restock.service';
import { GetAllDto, GetDetailsDto, RestockDto } from './types';
import { BaseResponse } from 'src/common/base/base.response';
import { CurrentUser, Role } from 'src/auth/types';
import type { AuthUser } from 'src/auth/types';
import { Roles } from 'src/auth/auth.decorator';
@Roles(Role.Owner, Role.InventoryManager)
@Controller('restocks')
export class RestockController {
    constructor(
        private service: RestockService,
    ) {}

    @Post()
    async restock(
        @CurrentUser() user: AuthUser, @Body() dto: RestockDto
    ) {
        await this.service.restock(user, dto);

        return new BaseResponse();
    }

    @Get()
    async getAll(@Query() dto: GetAllDto) {
        const data = await this.service.getAll(dto);

        return new BaseResponse(data);
    }

    @Get('details/:restock')
    async getDetails(
        @Param() dto: GetDetailsDto
    ) {
        const data = await this.service.getDetails(dto);

        return new BaseResponse(data);
    }
}
