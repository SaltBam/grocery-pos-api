import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/types';
import { BaseResponse } from 'src/common/base/base.response';
import { GetDto, UpdateBulkDto } from './types';

@Roles(Role.Owner, Role.InventoryManager)
@Controller('product')
export class ProductController {
    constructor(
        private service: ProductService,
    ) {}

    @Roles(Role.Owner, Role.InventoryManager, Role.Cashier)
    @Get(':EAN')
    async getByBarcode(@Param() dto: GetDto) {
        const data = await this.service.getByBarcode(dto);

        return new BaseResponse(data);
    }

    @Patch()
    async update(@Body() dto: UpdateBulkDto) {
        await this.service.update(dto);

        return new BaseResponse();
    }
}
