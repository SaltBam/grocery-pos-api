import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Restock } from './restock.schema';
import { Model, Types } from 'mongoose';
import { RestockDetails } from './restock-details.schema';
import { GetDetailDto, RestockDto } from './types';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class RestockService {
    constructor(
        @InjectModel(Restock.name) private model: Model<Restock>,
        @InjectModel(RestockDetails.name) private modelDetails: Model<RestockDetails>,
        private inventoryService: InventoryService,
    ) {}

    async restock(dto: RestockDto): Promise<void> {
        const { restockedBy, description, restockDetails } = dto; 

        const totalCost = restockDetails.reduce((sum, detail) => {
            return sum + detail.quantity * detail.unitCost
        }, 0);

        const created = (await this.model
            .create({
                description,
                restockedBy,
                totalCost
            })).toObject();

        const inserts = restockDetails
            .map((detail) => ({
                insertOne: { 
                    document: {
                        restock: created._id,
                        ...detail 
                    }
                }
            }));

        await Promise.all([
            this.modelDetails.bulkWrite(inserts),
            this.inventoryService.restock(dto)
        ]);
    }

    async getAll(): Promise<Restock[]> {
        return await this.model
            .find()
            .lean();
    }

    async getDetail(dto: GetDetailDto)
    : Promise<RestockDetails[]> {
        const { restock } = dto;
        console.log({restock})
        return await this.modelDetails
            .find({restock: restock})
            .lean();
    }
}
