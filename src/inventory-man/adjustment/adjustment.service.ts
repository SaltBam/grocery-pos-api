import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Adjustment } from './adjustment.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import { AdjustmentDetails } from './adjustment-details.schema';
import { AdjustDto, GetDetailsDto } from './types';
import { InventoryService } from '../inventory/inventory.service';
import { runInTransaction } from 'src/common/utils/db';

@Injectable()
export class AdjustmentService {
    constructor(
        @InjectConnection() private connection: Connection, 
        @InjectModel(Adjustment.name) private model: Model<Adjustment>,
        @InjectModel(AdjustmentDetails.name) private modelDetails: Model<AdjustmentDetails>,
        private inventoryService: InventoryService,
    ) {}

    async getAll(): Promise<Adjustment[]> {
        return await this.model
            .find()
            .lean();
    }

    async adjust(dto: AdjustDto, session?: ClientSession): Promise<void> {
        const { description, adjustDetails, adjustedBy } = dto;

        await runInTransaction(async (session) => {
            const [adjustment] = await this.model
                .create([{
                description,
                    adjustedBy,
                }], {session});
            
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
                this.modelDetails.bulkWrite(inserts, { session }),
                this.inventoryService.adjust(dto, session),
            ]);
        }, this.connection, session);
    }

    async getDetails(dto: GetDetailsDto): Promise<AdjustmentDetails[]> {
        const { adjustment } = dto;

        return await this.modelDetails
            .find({ adjustment })
            .lean();
    }
}