import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from '../auth/auth.decorator';
import { CurrentUser, Role } from '../auth/types';
import { BaseResponse } from '../common/base/base.response';
import {
  EnsureValidDto,
  GetAllDto,
  GetDto,
  MatchesDto,
  NewProductFields,
  NewProductsDto,
  UpdateBulkDto,
} from './types';

@Roles(Role.Owner, Role.InventoryManager)
@Controller('products')
export class ProductController {
  constructor(private service: ProductService) {}

  @Get('matches')
  async getMatches(@Query() dto: MatchesDto) {
      const data = await this.service.getMatches(dto)

      return new BaseResponse(data)
  }

  @Get('ensureValid')
  async ensureValid(@Query() dto: EnsureValidDto) {
    Logger.log(dto);
    await this.service.ensureValid(dto);

    return new BaseResponse();
  }

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

  @Get()
  async getAll(@Query() dto: GetAllDto) {
    const data = await this.service.getAll(dto);

    return new BaseResponse(data);
  }

  @Post('bulk')
  async addMany(@CurrentUser() user, @Body() dto: NewProductsDto) {
    await this.service.addMany(user, dto);

    return new BaseResponse();
  }  
}
