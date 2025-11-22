import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model } from 'mongoose';
import { UpdateManyReq } from './types';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private model: Model<Product>,
    ) {}

    async updateMany(dto: UpdateManyReq[]): Promise<void> {
        const updates = dto.map(({_id, update}) => ({
            updateOne: {
                filter: {_id },
                update: { $set: update }
            }
        }));

        await this.model.bulkWrite(updates);
    }
}
