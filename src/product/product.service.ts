import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model } from 'mongoose';
import { UpdateBulkDto } from './types';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private model: Model<Product>,
    ) {}

    async update(dto: UpdateBulkDto): Promise<void> {
        const updates = dto.updates.map(({_id, update}) => ({
            updateOne: {
                filter: {_id },
                update: { $set: update }
            }
        }));

        await this.model.bulkWrite(updates);
    }
}
