import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RestockService } from './restock.service';
import { GetDetailDto, RestockDto } from './types';
import { BaseResponse } from 'src/common/base/base.response';

@Controller('restocks')
export class RestockController {
    constructor(
        private service: RestockService,
    ) {}

    @Post()
    async restock(
        @Body() dto: RestockDto
    ) {
        console.log({dto})
        await this.service.restock(dto);

        return new BaseResponse();
    }

    @Get()
    async getAll() {
        const data = await this.service.getAll();

        return new BaseResponse(data);
    }

    @Get('details/:restock')
    async getDetail(
        @Param() dto: GetDetailDto
    ) {
        const data = await this.service.getDetail(dto);

        return new BaseResponse(data);
    }
}
