import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { BaseResponse } from 'src/common/base/base.response';
import { Roles } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/types';

@Roles(Role.Owner, Role.InventoryManager)
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
