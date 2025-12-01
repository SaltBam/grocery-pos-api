import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { GetDto, NewProductDto, NewProductFields, UpdateBulkDto } from './types';
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
        const updates = dto.updates.map(({product, update}) => ({
            updateOne: {
                filter: { _id: product },
                update: { $set: update }
            }
        }));

        await runInTransaction(async (session) => {
            await this.model.bulkWrite(updates, { session });
        }, this.connection, session)
    }

    async getMany(products: string[]) {
        const unique_ids = [...new Set(products)];

        const found = await this.model
            .find({_id: {$in: unique_ids}})
            .select('price')
            .lean();

        return new Map(found.map(item => [
                item._id.toString(), item
            ]));
    }

    async createMany(dto: NewProductFields[], session: ClientSession) {        
        const inserted = await this.model.insertMany(dto, { session });

        const EANMap: Record<string, string> = {};
        inserted.forEach(({_id, EAN}) => {
            EANMap[EAN] = _id.toString();
        });

        return EANMap
    }
}
