import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Inventory } from './inventory.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { RestockDto } from '../restock/types';
import { AdjustDto } from '../adjustment/types';
import { SellDto } from 'src/sales/types';

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

    async restock(dto: RestockDto, session: ClientSession): Promise<void> {
        const { restockDetails } = dto;

        const updates = restockDetails
            .map(({product, quantity}) => ({
                updateOne: {
                    filter: { product },
                    update: { $inc: { stock: quantity }}
                }
            }));

        await this.model.bulkWrite(updates, { session });
    }

    async adjust(dto: AdjustDto, session: ClientSession): Promise<void> {
        const { adjustDetails } = dto;

        const updates = adjustDetails
            .map(({product, change}) => ({
                updateOne: {
                    filter: { product },
                    update: { $inc: { stock: change } }
                }
            }));

        await this.model.bulkWrite(updates, { session });
    }

    async sell(dto: SellDto, session: ClientSession): Promise<void> {
        const { sellDetails } = dto;

        const updates = sellDetails
            .map(({product, quantity}) => ({
                updateOne: {
                    filter: { product },
                    update: { $inc: { stock: -quantity} }
                }
            }));
        
        await this.model.bulkWrite(updates, { session });
    }
}
