import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Sales } from './sales.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { SalesDetails } from './sales-details.schema';
import { GetDetailsDto, ReceiptDto, ReceiptFields, SellDto } from './types';
import { ProductService } from 'src/product/product.service';
import { runInTransaction } from 'src/common/utils/db';
import { InventoryService } from 'src/inventory-man/inventory/inventory.service';
import { UserService } from 'src/user/user.service';

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

    async getAll(): Promise<Sales[]> {
        return await this.model
            .find()
            .lean();
    }
    
    async getDetails(dto: GetDetailsDto)
    : Promise<SalesDetails[]> {
        const { sales } = dto;

        return await this.modelDetails
            .find({ sales })
            .lean();
    }

    async sell(dto: SellDto, session?: ClientSession) {
        const { cashier, paymentType, referenceNumber} = dto;

        const { totalAmount, fullSellDetails } = await this.prepareSell(dto);

        await runInTransaction(async (session) => {
            const [created] = await this.model.create([{
                amount: totalAmount,
                cashier,
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

        return await this.makeReceipt(fullSellDetails, cashier, totalAmount);
    }

    private async makeReceipt(
        itemsInfo: ReceiptFields[], cashier: Types.ObjectId, totalAmount: number
    ): Promise<ReceiptDto> {
        const items: ReceiptFields[] = 
            itemsInfo.map(({productName, quantity, amount}) => ({
                productName,
                quantity,
                amount
            }));

        const cashierName = await this.userService.getName(cashier);

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
