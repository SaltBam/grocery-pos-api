import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SalesService } from './sales.service';
import { GetDetailsDto, SellDto } from './types';
import { BaseResponse } from 'src/common/base/base.response';

@Controller('sales')
export class SalesController {
    constructor(
        private service: SalesService,
    ) {}

    @Get()
    async getAll() {
        const data = await this.service.getAll();

        return new BaseResponse(data);
    }

    @Get('details/:sales')
    async getDetails(@Param() dto: GetDetailsDto) {
        const data = await this.service.getDetails(dto);

        return new BaseResponse(data);
    }

    @Post()
    async sell(@Body() dto: SellDto) {
        const data = await this.service.sell(dto);

        return new BaseResponse(data);
    }
}
