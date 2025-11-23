import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RestockService } from './restock.service';
import { GetDetailReq, RestockReq } from './types';
import { BaseResponse } from 'src/common/base/base.response';

@Controller('restock')
export class RestockController {
    constructor(
        private service: RestockService,
    ) {}

    @Post()
    async restock(
        @Body() dto: RestockReq
    ) {
        console.log({dto})
        await this.service.restock(dto);

        return new BaseResponse();
    }

    @Get('all')
    async getAll() {
        const data = await this.service.getAll();

        return new BaseResponse(data);
    }

    @Get('details/:restock')
    async getDetail(
        @Param() dto: GetDetailReq
    ) {
        const data = await this.service.getDetail(dto);

        return new BaseResponse(data);
    }
}
