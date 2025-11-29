import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/types';
import { BaseResponse } from 'src/common/base/base.response';
import { UpdateBulkDto } from './types';

@Roles(Role.Owner)
@Controller('product')
export class ProductController {
    constructor(
        private service: ProductService,
    ) {}

    @Patch()
    async update(@Body() dto: UpdateBulkDto) {
        await this.service.update(dto);

        return new BaseResponse();
    }
}
