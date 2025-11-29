import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Inventory } from './inventory.schema';
import { Model, Types } from 'mongoose';
import { RestockDto } from '../restock/types';
import { AdjustDto } from '../adjustment/types';

@Injectable()
export class InventoryService {
    constructor(
        @InjectModel(Inventory.name) private model: Model<Inventory>,
    ) {}

    async getAll(): Promise<Inventory[]> {
        return await this.model
            .find()
            .populate([
                { path: 'product' },
                { path: 'updatedBy', select: 'name -_id' }
            ])
            .lean();
    }

    async restock(dto: RestockDto) {
        const { restockDetails } = dto;

        const updates = restockDetails
            .map(({product, quantity}) => ({
                updateOne: {
                    filter: { product },
                    update: { $inc: { stock: quantity }}
                }
            }));

        await this.model.bulkWrite(updates);
    }

    async adjust(dto: AdjustDto) {
        const { adjustDetails } = dto;

        const updates = adjustDetails
            .map(({product, change}) => ({
                updateOne: {
                    filter: { product },
                    update: { $inc: { stock: change } }
                }
            }));

        await this.model.bulkWrite(updates);
    }
}
