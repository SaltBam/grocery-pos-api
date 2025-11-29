import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AdjustmentService } from './adjustment.service';
import { BaseResponse } from 'src/common/base/base.response';
import { AdjustDto, GetDetailsDto } from './types';

@Controller('adjustments')
export class AdjustmentController {
    constructor(
        private service: AdjustmentService
    ) {}

    @Post()
    async adjust(@Body() dto: AdjustDto) {
        await this.service.adjust(dto);

        return new BaseResponse();
    }

    @Get()
    async getAll() {
        const data = await this.service.getAll();

        return new BaseResponse(data); 
    }

    @Get('details/:adjustment')
    async getDetails(@Param() dto: GetDetailsDto) {
        const data = await this.service.getDetails(dto);

        return new BaseResponse(data);
    }
}
