import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Inventory } from './inventory.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { RestockDto, RestockFields } from '../restock/types';
import { AdjustDto } from '../adjustment/types';
import { SellDto } from 'src/sales/types';
import { ProductService } from 'src/product/product.service';
import { NewProductDto, NewProductFields } from 'src/product/types';
import { AuthUser } from 'src/auth/types';
import { GetAllDto } from './types';

@Injectable()
export class InventoryService {
    constructor(
        @InjectModel(Inventory.name) private model: Model<Inventory>,
        private productService: ProductService,
    ) {}

    async getAll(dto: GetAllDto): Promise<{data: Inventory[], pages: number}> {        
        const {productIds, pages} = await this.productService.getAllExec(dto);

        const data = await this.model.find({
            product: { $in: productIds }
        }).populate('product')
        .lean();

        return {
            data, pages
        }
    }

    async restock(
        user: AuthUser, dto: RestockDto, session: ClientSession
    ) {
        const { restockDetails } = dto;

        const newProducts = restockDetails
            .filter(
                (d): d is RestockFields & { newProduct: NewProductFields } =>
                    !!d.newProduct
            )
            .map((details) => details.newProduct);
        
        const EANMap = await this.productService.createMany(newProducts, session);

        const updatedRestockDetails = restockDetails.map((details) => {
            let product =
                details.product ?? EANMap[details.newProduct!.EAN];

            return {
                product, quantity: details.quantity, 
                updatedBy: user.userId, unitCost: details.unitCost
            }
        });

        const updates = updatedRestockDetails
            .filter(({product}) => !!product)
            .map(({product, quantity, updatedBy}) => ({
                updateOne: {
                    filter: { product },
                    update: { 
                        $inc: { stock: quantity },
                        $setOnInsert: { updatedBy, product }
                    }, upsert: true
                }
            }));

        await this.model.bulkWrite(updates, { session });

        return updatedRestockDetails;
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
