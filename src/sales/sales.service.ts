import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Sales } from './sales.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { SalesDetails } from './sales-details.schema';
import { GetAllDto, GetDetailsDto, ReceiptDto, ReceiptFields, SellDto } from './types';
import { ProductService } from 'src/product/product.service';
import { runInTransaction } from 'src/common/utils/db';
import { InventoryService } from 'src/inventory-man/inventory/inventory.service';
import { UserService } from 'src/user/user.service';
import { AuthUser } from 'src/auth/types';

@Injectable()
export class SalesService {
    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Sales.name) private model: Model<Sales>,
        @InjectModel(SalesDetails.name) private modelDetails: Model<SalesDetails>,
        private productService: ProductService,
        private inventoryService: InventoryService,
        private userService: UserService,
    ) {}
    
    async getAll(dto: GetAllDto): Promise<{data: Sales[], pages: number}> {
        const { page, limit} = dto;
        
        const skip = (page - 1) * limit;

        const [data, totalItems] = await Promise.all([
            this.model.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'cashier',
                select: 'name'
            })
            .lean(),

            this.model.countDocuments()
        ]);

        const pages = Math.ceil(totalItems / limit)

        return {
            data, pages
        }
    }

    async getDetails(dto: GetDetailsDto)
    : Promise<SalesDetails[]> {
        const { sales } = dto;

        return await this.modelDetails
            .find({ sales })
            .populate({
                path: 'product',
                select: 'name'
            })
            .lean();
    }

    async sell(user: AuthUser, dto: SellDto, session?: ClientSession) {
        const { paymentType, referenceNumber} = dto;

        const { totalAmount, fullSellDetails } = await this.prepareSell(dto);

        await runInTransaction(async (session) => {
            const [created] = await this.model.create([{
                amount: totalAmount,
                cashier: user.userId,
                paymentType,
                referenceNumber,
            }], { session });
    
            const inserts = fullSellDetails
                .map(({product, quantity, unitPrice}) => ({
                    insertOne: {
                        document: {
                            product,
                            quantity,
                            unitPrice,
                            sales: created._id,
                        }
                    }
            }));
    
                await this.modelDetails.bulkWrite(inserts, { session });
                await this.inventoryService.sell(dto, session);
        }, this.connection, session);

        return await this.makeReceipt(fullSellDetails, user.username, totalAmount);
    }

    private async makeReceipt(
        itemsInfo: ReceiptFields[], cashierName: string, totalAmount: number
    ): Promise<ReceiptDto> {
        const items: ReceiptFields[] = 
            itemsInfo.map(({productName, quantity, amount}) => ({
                productName,
                quantity,
                amount
            }));

        return {
            cashierName, 
            items,
            totalAmount
        }
    }

    private async prepareSell(dto: SellDto) {
        const { sellDetails } = dto;

        const productsMap = await this.productService
        .getMany(sellDetails.map(detail => detail.product));
        
        Logger.log({sellDetails, productsMap})
        let totalAmount = 0;

        const fullSellDetails = sellDetails.map(
            ({product, quantity}) => {
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
                }
            }
        );

        return { totalAmount, fullSellDetails };
    }
}
