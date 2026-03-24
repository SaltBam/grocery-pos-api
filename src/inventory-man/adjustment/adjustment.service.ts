import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Adjustment } from './adjustment.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import { AdjustmentDetails } from './adjustment-details.schema';
import { AdjustDto, GetAllDto, GetDetailsDto } from './types';
import { InventoryService } from '../inventory/inventory.service';
import { runInTransaction } from 'src/common/utils/db';
import { AuthUser } from 'src/auth/types';

@Injectable()
export class AdjustmentService {
    constructor(
        @InjectConnection() private connection: Connection, 
        @InjectModel(Adjustment.name) private model: Model<Adjustment>,
        @InjectModel(AdjustmentDetails.name) private modelDetails: Model<AdjustmentDetails>,
        private inventoryService: InventoryService,
    ) {}

    async getAll(dto: GetAllDto): Promise<{data: Adjustment[], totalItems: number}> {
        const { page, limit } = dto;
        
        const skip = (page - 1) * limit;

        const [data, totalItems] = await Promise.all([
            this.model.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'adjustedBy',
                select: 'name'
            })
            .lean(),

            this.model.countDocuments()
        ]);

        return {
            data, totalItems
        }
    }

    async adjust(
        user: AuthUser, dto: AdjustDto, session?: ClientSession
    ): Promise<void> {
        const { description, adjustDetails } = dto;

        await runInTransaction(async (session) => {
            const [adjustment] = await this.model
                .create([{
                description,
                    adjustedBy: user.userId,
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
    
            await this.modelDetails.bulkWrite(inserts, { session });
            await this.inventoryService.adjust(dto, session);
        }, this.connection, session);
    }

    async getDetails(dto: GetDetailsDto): Promise<AdjustmentDetails[]> {
        const { adjustment } = dto;

        return await this.modelDetails
            .find({ adjustment })
            .populate({
                path: 'product',
                select: 'name'
            })
            .lean();
    }
}