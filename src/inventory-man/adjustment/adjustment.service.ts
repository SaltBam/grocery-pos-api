import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Adjustment } from './adjustment.schema';
import { Model } from 'mongoose';
import { AdjustmentDetails } from './adjustment-details.schema';
import { AdjustDto, GetDetailsDto } from './types';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class AdjustmentService {
    constructor(
       @InjectModel(Adjustment.name) private model: Model<Adjustment>,
       @InjectModel(AdjustmentDetails.name) private modelDetails: Model<AdjustmentDetails>,
       private inventoryService: InventoryService,
    ) {}

    async getAll(): Promise<Adjustment[]> {
        return await this.model
            .find()
            .lean();
    }

    async adjust(dto: AdjustDto): Promise<void> {
        const { description, adjustDetails, adjustedBy } = dto;

        const adjustment = (await this.model
            .create({
                description,
                adjustedBy,
            })).toObject();
        
        const inserts = adjustDetails
            .map((detail) => ({
                insertOne: {
                    document: {
                        adjustment: adjustment._id,
                        ...detail
                    }
                }     
        }));

        await Promise.all([
            this.modelDetails.bulkWrite(inserts),
            this.inventoryService.adjust(dto),
        ]);
    }

    async getDetails(dto: GetDetailsDto): Promise<AdjustmentDetails[]> {
        const { adjustment } = dto;

        return await this.modelDetails
            .find({ adjustment })
            .lean();
    }
}