import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Sales } from './sales.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import { SalesDetails } from './sales-details.schema';
import {
    GetAllDto,
    GetDetailsDto,
    ReceiptDto,
    ReceiptFields,
    SellDto,
} from './types';
import { ProductService } from '../product/product.service';
import { runInTransaction } from '../common/utils/db';
import { InventoryService } from '../inventory-man/inventory/inventory.service';
import { UserService } from '../user/user.service';
import { AuthUser } from '../auth/types';

@Injectable()
export class SalesService {
    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Sales.name) private model: Model<Sales>,
        @InjectModel(SalesDetails.name)
        private modelDetails: Model<SalesDetails>,
        private productService: ProductService,
        private inventoryService: InventoryService,
        private userService: UserService,
    ) {}

    async getAll(
        dto: GetAllDto,
    ): Promise<{ data: Sales[]; totalItems: number }> {
        const { page, limit } = dto;

        const skip = (page - 1) * limit;

        const [data, totalItems] = await Promise.all([
            this.model
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'cashier',
                    select: 'name',
                })
                .lean(),

            this.model.countDocuments(),
        ]);

        return {
            data,
            totalItems,
        };
    }

    async getDetails(dto: GetDetailsDto): Promise<SalesDetails[]> {
        const { sale } = dto;

        return await this.modelDetails
            .find({ sale })
            .populate({
                path: 'product',
                select: 'name',
            })
            .lean();
    }

    async sell(user: AuthUser, dto: SellDto, session?: ClientSession) {
        const { paymentType, referenceNumber } = dto;

        const { totalAmount, fullSellDetails } = await this.prepareSell(dto);

        await runInTransaction(
            async (session) => {
                const [created] = await this.model.create(
                    [
                        {
                            amount: totalAmount,
                            cashier: user.userId,
                            paymentType,
                            referenceNumber,
                        },
                    ],
                    { session },
                );

                const inserts = fullSellDetails.map(
                    ({ product, quantity, unitPrice }) => ({
                        insertOne: {
                            document: {
                                product,
                                quantity,
                                unitPrice,
                                sales: created._id,
                            },
                        },
                    }),
                );

                await this.modelDetails.bulkWrite(inserts, { session });
                await this.inventoryService.sell(dto, session);
            },
            this.connection,
            session,
        );

        return this.makeReceipt(fullSellDetails, user.username, totalAmount);
    }

    private makeReceipt(
        itemsInfo: ReceiptFields[],
        cashierName: string,
        totalAmount: number,
    ): ReceiptDto {
        const items: ReceiptFields[] = itemsInfo.map(
            ({ productName, quantity, amount }) => ({
                productName,
                quantity,
                amount,
            }),
        );

        return {
            cashierName,
            items,
            totalAmount,
        };
    }

    private async prepareSell(dto: SellDto) {
        const { sellDetails } = dto;

        const productsMap = await this.productService.getMany(
            sellDetails.map((detail) => detail.product),
        );

        Logger.log({ sellDetails, productsMap });
        let totalAmount = 0;

        const fullSellDetails = sellDetails.map(({ product, quantity }) => {
            //Note: account more thoroughly for when product is somehow missing
            const unitPrice = productsMap.get(product.toString())!.price;
            const productName = productsMap.get(product.toString())!.name;

            totalAmount += unitPrice * quantity;

            return {
                product,
                productName,
                amount: unitPrice * quantity,
                quantity,
                unitPrice,
            };
        });

        return { totalAmount, fullSellDetails };
    }
}
