import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { BaseResponse } from 'src/common/base/base.response';

@Controller('inventories')
export class InventoryController {
    constructor(
        private service: InventoryService,
    ) {}

    @Get()
    async getAll() {
        const data = await this.service.getAll();

        return new BaseResponse(data);
    }
}
