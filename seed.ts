import mongoose from 'mongoose';
import { Role } from './src/auth/types/auth.types';
import { User, UserSchema } from './src/user/user.schema';
import * as argon from 'argon2';
import { randomInt } from 'crypto';
import { Product, ProductSchema } from './src/product/product.schema';
import {
  Inventory,
  InventorySchema,
} from 'src/inventory-man/inventory/inventory.schema';
import {
  Restock,
  RestockSchema,
} from 'src/inventory-man/restock/restock.schema';
import {
  RestockDetails,
  RestockDetailsSchema,
} from 'src/inventory-man/restock/restock-details.schema';
import {
  Adjustment,
  AdjustmentSchema,
} from 'src/inventory-man/adjustment/adjustment.schema';
import {
  AdjustmentDetails,
  AdjustmentDetailsSchema,
} from 'src/inventory-man/adjustment/adjustment-details.schema';
import { Sales, SalesSchema } from 'src/sales/sales.schema';
import {
  SalesDetails,
  SalesDetailsSchema,
} from 'src/sales/sales-details.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/auth/refresh-token/refresh-token.schema';
import { Category } from 'src/product/types';

const user = mongoose.model(User.name, UserSchema);
const product = mongoose.model(Product.name, ProductSchema);
const inventory = mongoose.model(Inventory.name, InventorySchema);
const restock = mongoose.model(Restock.name, RestockSchema);
const refreshToken = mongoose.model(RefreshToken.name, RefreshTokenSchema);
const restockDetails = mongoose.model(
  RestockDetails.name,
  RestockDetailsSchema,
);
const adjustment = mongoose.model(Adjustment.name, AdjustmentSchema);
const adjustmentDetails = mongoose.model(
  AdjustmentDetails.name,
  AdjustmentDetailsSchema,
);
const sales = mongoose.model(Sales.name, SalesSchema);
const salesDetails = mongoose.model(SalesDetails.name, SalesDetailsSchema);

seedAll()
  .then(() => {
    console.log('Seeding complete...');
  })
  .catch((err) => {
    console.log('Error in seeding: ', err);
  })
  .finally(() => {
    process.exit(0);
  });

async function seedAll() {
  await mongoose.connect('mongodb://127.0.0.1/grocery');

  await Promise.all([
    seedUser(),
    seedProduct(),
    restock.collection.drop(),
    restockDetails.collection.drop(),
    adjustment.collection.drop(),
    adjustmentDetails.collection.drop(),
    sales.collection.drop(),
    salesDetails.collection.drop(),
    refreshToken.collection.drop(),
  ]);

  //must run after seedProduct()
  (await seedInventory(), await mongoose.disconnect());
}

async function seedUser() {
  const hash = await argon.hash('a');

  let users = Object.keys(Role).map((key) => ({
    name: key,
    passwordHash: hash,
    roles: [Role[key]],
  }));

  const inactives = Object.keys(Role).map((key) => ({
    name: key + '1',
    passwordHash: hash,
    roles: [Role[key]],
    isActive: false,
  }));

  users = users.concat(inactives);

  console.log(users);
  await user.collection.drop();
  return await user.insertMany(users);
}

async function seedProduct() {
  const productData = [
    { name: 'BREAD', category: Category.FOOD },
    { name: 'APPLES', category: Category.FOOD },
    { name: 'RICE', category: Category.FOOD },
    { name: 'PASTA', category: Category.FOOD },

    { name: 'COFFEE', category: Category.DRINKS },
    { name: 'WATER', category: Category.DRINKS },
    { name: 'ORANGE_JUICE', category: Category.DRINKS },
    { name: 'MILK', category: Category.DRINKS },

    { name: 'HEADPHONES', category: Category.ELECTRONICS },
    { name: 'SMARTPHONE', category: Category.ELECTRONICS },
    { name: 'CHARGING_CABLE', category: Category.ELECTRONICS },
    { name: 'POWER_BANK', category: Category.ELECTRONICS },

    { name: 'PAPER_TOWELS', category: Category.HOUSEHOLD },
    { name: 'DISH_SOAP', category: Category.HOUSEHOLD },
    { name: 'BIBLE', category: Category.HOUSEHOLD },
    { name: 'LAUNDRY_DETERGENT', category: Category.HOUSEHOLD },

    { name: 'COTTON_TSHIRT', category: Category.CLOTHES },
    { name: 'DENIM_JEANS', category: Category.CLOTHES },
    { name: 'WINTER_JACKET', category: Category.CLOTHES },
    { name: 'ANKLE_SOCKS', category: Category.CLOTHES },
  ];

  let currentEAN = 10000000;

  const products = await Promise.all(
    productData.map(async (item) => ({
      EAN: (currentEAN++).toString(),
      name: item.name,
      category: item.category,
      price: randomInt(10, 1000),
    })),
  );

  console.log(products);
  await product.collection.drop();
  return await product.insertMany(products);
}

async function seedInventory() {
  const [users, products] = await Promise.all([
    user.find({ roles: Role.Owner }).lean(),
    product.find().lean(),
  ]);

  const usersLen = users.length;

  const inventories = products.map((prod, idx) => ({
    product: prod._id,
    stock: randomInt(0, 500),
    updatedBy: users[idx % usersLen]._id,
  }));

  console.log(inventories);
  await inventory.collection.drop();
  await inventory.insertMany(inventories);
}
