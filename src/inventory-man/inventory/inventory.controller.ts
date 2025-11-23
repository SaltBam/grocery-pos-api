import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { BaseResponse } from 'src/common/base/base.response';

@Controller('inventory')
export class InventoryController {
    constructor(
        private service: InventoryService,
    ) {}

    @Get('all')
    async getAll() {
        const data = await this.service.getAll();

        return new BaseResponse(data);
    }
}
