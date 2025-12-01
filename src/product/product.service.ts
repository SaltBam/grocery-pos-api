import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { GetDto, UpdateBulkDto } from './types';
import { runInTransaction } from 'src/common/utils/db';

@Injectable()
export class ProductService {
    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Product.name) private model: Model<Product>,
    ) {}

    async getByBarcode(dto: GetDto): Promise<Product> {
        const { EAN } = dto;

        const product = await this.model
            .findOne({ EAN })
            .lean();
        
        if (!product) {
            throw new NotFoundException(`No Product found`);
        }

        return product;
    }

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

    async getMany(products: Types.ObjectId[]) {
        const unique_ids = [...new Set(products.map(p => p.toString()))];

        const found = await this.model
            .find({_id: {$in: unique_ids}})
            .select('price')
            .lean();

        return new Map(found.map(item => [
                item._id.toString(), item
            ]));
    }
}
