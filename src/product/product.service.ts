import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import { UpdateBulkDto } from './types';
import { runInTransaction } from 'src/common/utils/db';

@Injectable()
export class ProductService {
    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Product.name) private model: Model<Product>,
    ) {}

    async update(dto: UpdateBulkDto, session?: ClientSession): Promise<void> {
        const updates = dto.updates.map(({_id, update}) => ({
            updateOne: {
                filter: {_id },
                update: { $set: update }
            }
        }));

        await runInTransaction(async (session) => {
            await this.model.bulkWrite(updates, { session });
        }, this.connection, session)
    }
}
