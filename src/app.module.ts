import { Module } from '@nestjs/common';
import { TypedConfigModule } from './common/typed-config/typed-config.module';
import { CookieModule } from './common/utils/cookie/cookie.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from './auth/guards/jwt.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { RefreshTokenModule } from './auth/refresh-token/refresh-token.module';
import { GlobalFilter } from './common/global/global.filter';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory-man/inventory/inventory.module';
import { RestockModule } from './inventory-man/restock/restock.module';
import { AdjustmentModule } from './inventory-man/adjustment/adjustment.module';
import { SalesModule } from './sales/sales.module';
import { EanCounterModule } from './ean-counter/ean-counter.module';

@Module({
    imports: [
        TypedConfigModule,
        CookieModule,
        AuthModule,
        RefreshTokenModule,
        UserModule,
        MongooseModule.forRoot('mongodb://127.0.0.1:27017/grocery'),
        ProductModule,
        InventoryModule,
        RestockModule,
        AdjustmentModule,
        SalesModule,
        EanCounterModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JWTAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
        {
            provide: APP_FILTER,
            useClass: GlobalFilter,
        },
    ],
})
export class AppModule {}
