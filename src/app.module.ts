import { Module } from '@nestjs/common';
import { TypedConfigModule } from './typed-config/typed-config.module';

@Module({
  imports: [TypedConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
