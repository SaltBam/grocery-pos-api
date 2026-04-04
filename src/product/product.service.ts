import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import {
  GetAllDto,
  GetDto,
  NewProductsDto,
  NewProductFields,
  UpdateBulkDto,
  EnsureValidDto,
  MatchesDto,
} from './types';
import { runInTransaction } from 'src/common/utils/db';
import { InventoryService } from 'src/inventory-man/inventory/inventory.service';
import { AuthUser } from 'src/auth/types';

@Injectable()
export class ProductService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Product.name) private model: Model<Product>,
    private inventoryService: InventoryService,
  ) {}

  async getByBarcode(dto: GetDto): Promise<Product> {
    Logger.log('BARCODE');
    const { EAN } = dto;

    const product = await this.model.findOne({ EAN }).lean();

    if (!product) {
      throw new NotFoundException(`No Product found`);
    }

    return product;
  }

  async update(dto: UpdateBulkDto, session?: ClientSession): Promise<void> {
    const updates = dto.updates.map(({ product, update }) => ({
      updateOne: {
        filter: { _id: product },
        update: { $set: update },
      },
    }));

    await runInTransaction(
      async (session) => {
        await this.model.bulkWrite(updates, { session });
      },
      this.connection,
      session,
    );
  }

  async getMany(products: string[]) {
    const unique_ids = [...new Set(products)];

    const found = await this.model
      .find({ _id: { $in: unique_ids } })
      .select('price')
      .lean();

    return new Map(found.map((item) => [item._id.toString(), item]));
  }

  async getAll(
    dto: GetAllDto,
  ): Promise<{ data: Product[]; totalItems: number }> {
    const { page, limit, name, EAN } = dto;

    const skip = (page - 1) * limit;

    let query: any = {};
    if (name) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: `^${escaped}`, $options: 'i' };
    }
    if (EAN) {
      const escaped = EAN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.EAN = { $regex: `^${escaped}`, $options: 'i' };
    }

    const [data, totalItems] = await Promise.all([
      this.model.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),

      this.model.countDocuments(query),
    ]);

    return {
      data,
      totalItems,
    };
  }

  async getAllExec(
    dto: GetAllDto,
  ): Promise<{ productIds: Types.ObjectId[]; totalItems: number }> {
    const { page, limit, name, EAN } = dto;

    const skip = (page - 1) * limit;

    let query: any = {};
    if (name) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escaped };
    }
    if (EAN) {
      const escaped = EAN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.EAN = { $regex: `^${escaped}` };
    }

    Logger.log({ query, dto });

    const [data, totalItems] = await Promise.all([
      this.model
        .find(query, '_id')
        .sort({ name: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.model.countDocuments(query),
    ]);

    const productIds = data.map((x) => x._id);
    Logger.log(data, productIds)

    return {
      productIds,
      totalItems,
    };
  }

  async createMany(dto: NewProductFields[], session: ClientSession) {
    const inserted = await this.model.insertMany(dto, { session });

    const EANMap: Record<string, string> = {};
    inserted.forEach(({ _id, EAN }) => {
      EANMap[EAN] = _id.toString();
    });

    return EANMap;
  }

  async addMany(user: AuthUser, dto: NewProductsDto) {
    const inserted = await this.model.insertMany(dto.newProducts);
    const ids = inserted.map((doc) => doc._id);

    await this.inventoryService.createMany(
      ids,
      new Types.ObjectId(user.userId),
    );
  }

  async ensureValid(dto: EnsureValidDto) {
    const { EAN, name, autoGenerateEAN } = dto;

    const found = await this.model
      .findOne({
        $or: [{ EAN: EAN }, { name: name }],
      })
      .lean();

    Logger.log({ found }, { dto });
    const duplicates: string[] = [];
    if (found) {
      if (!autoGenerateEAN && found.EAN === EAN) duplicates.push('EAN');

      if (found.name === name) duplicates.push('name');

      throw new BadRequestException(duplicates);
    }
  }

  async getMatches(dto: MatchesDto): Promise<{EAN: string, name: string, product: string}[]> {
    const { EAN, name } = dto

    const query: any = {}
    if (EAN) {
      const escaped = EAN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.EAN = { $regex: `^${escaped}` };
    } else if (name) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: `${escaped}` };
    } else {
      return []
    }

    const matches = await this.model.find(query, 'name EAN')
    .sort({name: 1})
    .limit(5)
    .lean()
    
    Logger.log({query, matches})

    return matches.map(match => ({EAN: match.EAN, name: match.name, product: match._id.toString()}))
  }
}
