import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Inventory } from './inventory.schema';
import { Model } from 'mongoose';

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
}
