import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RestockService } from './restock.service';
import { GetDetailsDto, RestockDto } from './types';
import { BaseResponse } from 'src/common/base/base.response';
import { CurrentUser } from 'src/auth/types';
import type { AuthUser } from 'src/auth/types';
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
    async getAll() {
        const data = await this.service.getAll();

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
