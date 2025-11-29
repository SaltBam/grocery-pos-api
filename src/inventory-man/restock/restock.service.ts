import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Restock } from './restock.schema';
import { Model, Types } from 'mongoose';
import { RestockDetails } from './restock-details.schema';
import { GetDetailDto, RestockDto } from './types';

@Injectable()
export class RestockService {
    constructor(
        @InjectModel(Restock.name) private model: Model<Restock>,
        @InjectModel(RestockDetails.name) private modelDetails: Model<RestockDetails>,
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

        await this.modelDetails.bulkWrite(inserts);
    }

    async getAll(): Promise<Restock[]> {
        return await this.model
            .find()
            .lean();
    }

    async getDetail(dto: GetDetailDto)
    : Promise<RestockDetails[]> {
        const { restock_id } = dto;
        console.log({restock_id})
        return await this.modelDetails
            .find({restock: restock_id})
            .lean();
    }
}
