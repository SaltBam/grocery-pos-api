import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AdjustmentService } from './adjustment.service';
import { BaseResponse } from 'src/common/base/base.response';
import { AdjustDto, GetAllDto, GetDetailsDto } from './types';
import { CurrentUser, Role } from 'src/auth/types';
import type { AuthUser } from 'src/auth/types';
import { Roles } from 'src/auth/auth.decorator';
@Roles(Role.Owner, Role.InventoryManager)
@Controller('adjustments')
export class AdjustmentController {
    constructor(
        private service: AdjustmentService
    ) {}

    @Post()
    async adjust(@CurrentUser() user: AuthUser, @Body() dto: AdjustDto) {
        await this.service.adjust(user, dto);

        return new BaseResponse();
    }

    @Get()
    async getAll(@Query() dto: GetAllDto) {
        const data = await this.service.getAll(dto);

        return new BaseResponse(data); 
    }

    @Get('details/:adjustment')
    async getDetails(@Param() dto: GetDetailsDto) {
        const data = await this.service.getDetails(dto);

        return new BaseResponse(data);
    }
}
