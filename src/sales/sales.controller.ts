import { Body, Controller, Get, Post } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SellDto } from './types';
import { BaseResponse } from 'src/common/base/base.response';

@Controller('sales')
export class SalesController {
    constructor(
        private service: SalesService,
    ) {}

    @Post()
    async sell(@Body() dto: SellDto) {
        const data = await this.service.sell(dto);

        return new BaseResponse(data);
    }
}
