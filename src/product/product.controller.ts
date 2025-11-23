import { Controller, Patch, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/types';
import { UpdateManyReq } from './types';
import { BaseResponse } from 'src/common/base/base.response';

@Roles(Role.Owner)
@Controller('product')
export class ProductController {
    constructor(
        private service: ProductService,
    ) {}

    @Patch('many')
    async updateMany(dto: UpdateManyReq[]) {
        await this.service.updateMany(dto);

        return new BaseResponse();
    }
}
