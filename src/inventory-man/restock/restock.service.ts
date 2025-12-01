import { Injectable, Type } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Restock } from './restock.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { RestockDetails } from './restock-details.schema';
import { GetDetailsDto, RestockDto } from './types';
import { InventoryService } from '../inventory/inventory.service';
import { runInTransaction } from 'src/common/utils/db';
import { AuthUser } from 'src/auth/types';

@Injectable()
export class RestockService {
    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Restock.name) private model: Model<Restock>,
        @InjectModel(RestockDetails.name) private modelDetails: Model<RestockDetails>,
        private inventoryService: InventoryService,
    ) {}

    async restock(
        user: AuthUser, dto: RestockDto, session?: ClientSession
    ): Promise<void> {
        const { description, restockDetails } = dto; 

        const totalCost = restockDetails.reduce((sum, detail) => {
            return sum + detail.quantity * detail.unitCost
        }, 0);

        await runInTransaction(async (session) => {
            const updatedRestockDetails = await 
                this.inventoryService.restock(user, dto, session);
            
            const [created] = await this.model
                .create([{
                    description,
                    restockedBy: user.userId,
                    totalCost
                }], {session});
    
            const inserts = updatedRestockDetails
                .map((detail) => ({
                    insertOne: { 
                        document: {
                            restock: created._id,
                            ...detail 
                        }
                    }
                }));
    
                await this.modelDetails.bulkWrite(inserts, {session});
        }, this.connection, session);
    }

    async getAll(): Promise<Restock[]> {
        return await this.model
            .find()
            .populate({
                path: 'restockedBy',
                select: 'name'
            })
            .lean();
    }

    async getDetails(dto: GetDetailsDto)
    : Promise<RestockDetails[]> {
        const { restock } = dto;

        return await this.modelDetails
            .find({restock: restock})
            .populate({
                path: 'product',
                select: 'name'
            })
            .lean();
    }
}
