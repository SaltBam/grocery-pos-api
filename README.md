# GroceryPOS API Documentation

> A comprehensive guide to the GroceryPOS backend API.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Project Overview](#2-project-overview)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [How It All Fits Together](#5-how-it-all-fits-together)
6. [Modules & Architecture](#6-modules--architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Endpoints](#8-api-endpoints)
9. [Data Models](#9-data-models)
10. [Key Services](#10-key-services)
11. [Common Patterns](#11-common-patterns)

---

## 1. Quick Start

### Want to run it?

```bash
# 1. Navigate to API directory
cd grocery-pos-api

# 2. Start MongoDB with Docker
docker-compose up -d

# 3. Install dependencies
pnpm install

# 4. Seed the database (first run only)
pnpm run seed

# 5. Start development server
pnpm run start:dev
```

### Database

The API uses MongoDB at `mongodb://127.0.0.1:27017/grocery`

**Docker Compose** (`docker-compose.yml`) starts a MongoDB container:
- Image: `mongo:latest`
- Port: `27017`
- Includes replica set configuration (`--replSet rs0`)
- Data persists in `mongodb_data` volume

### First Run Checklist

1. Run `docker-compose up -d` to start MongoDB
2. Wait a few seconds for MongoDB to initialize
3. Run `pnpm run seed` to populate test data
4. Run `pnpm run start:dev` to start the API

### Seeding the Database

The `seed.ts` script populates the database with test data:

```bash
pnpm run seed
```

**What gets seeded:**
- **Users** - One for each role (Owner, Cashier, InventoryManager) + inactive variants. Password: `a`
- **Products** - 20 products across categories (Food, Drinks, Electronics, Household, Clothes)
- **Inventory** - Stock levels for all products (random 0-500)
- **Restocks** - 5 sample restock batches with details
- **Adjustments** - 5 sample adjustment batches with details
- **Sales** - Clears any existing transaction data

**Test credentials:**
| Username | Password | Role |
|----------|----------|------|
| owner | a | Owner |
| cashier | a | Cashier |
| inventorymanager | a | Inventory Manager |

(Add "1" suffix for inactive versions, e.g., `owner1`)

### Environment Variables

Required config (via `typed-config`):
- `PORT` - Server port
- `JWT_SECRET` - Secret for signing JWTs
- `JWT_EXPIRY` - JWT expiration time
- `REFRESH_EXPIRY` - Refresh token expiration
- `EAN_COUNTER_ID` - ID for EAN counter document
- `EAN_COUNTER_DIGITS` - Number of digits for EAN counter

---

## 2. Project Overview

**What is this?**
GroceryPOS API is the backend for the GroceryPOS point-of-sale system. It's a NestJS application that provides:

- **Authentication** - Login, logout, token refresh with JWT + cookies
- **User Management** - CRUD operations for system users
- **Product Management** - Create, list, update products with EAN generation
- **Inventory Tracking** - Stock levels per product
- **Restock Operations** - Recording inventory additions
- **Stock Adjustments** - Recording inventory corrections
- **Sales Recording** - Recording point-of-sale transactions

**The Big Picture**

```
Client (Vue)  →  HTTP Request  →  API (NestJS)
                                    ↓
                               JWT Auth
                                    ↓
                              Controller
                                    ↓
                              Service
                                    ↓
                              MongoDB
```

---

## 3. Tech Stack

| Technology | What It Does |
|------------|--------------|
| **NestJS** | Backend framework with modules, controllers, services |
| **Mongoose** | MongoDB ODM for schema definitions and queries |
| **Passport JWT** | JWT-based authentication strategy |
| **Argon2** | Password hashing (secure) |
| **class-validator** | Request validation with DTOs |
| **class-transformer** | Object transformation and mapping |
| **Zod** | Schema validation (used in error handling) |
| **Cookie Parser** | HTTP cookie parsing and signing |

### All Dependencies

```
@nestjs/common ^11.0.1
@nestjs/core ^11.0.1
@nestjs/jwt ^11.0.1
@nestjs/mongoose ^11.0.3
@nestjs/passport ^11.0.5
mongoose ^8.19.3
passport-jwt ^4.0.1
argon2 ^0.44.0
class-transformer ^0.5.1
class-validator ^0.14.2
cookie-parser ^1.4.7
zod ^4.1.12
```

---

## 4. Folder Structure

```
src/
├── main.ts                    # App bootstrap, middleware setup
├── app.module.ts              # Root module, registers all modules
│
├── auth/                      # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts     # Login, logout, refresh endpoints
│   ├── auth.service.ts       # Token generation, validation
│   ├── jwt.strategy.ts       # Passport JWT strategy
│   ├── auth.decorator.ts     # @Public(), @Roles() decorators
│   ├── guards/
│   │   ├── jwt.guard.ts      # JWT authentication guard
│   │   └── role.guard.ts     # Role-based access guard
│   ├── refresh-token/
│   │   ├── refresh-token.module.ts
│   │   ├── refresh-token.service.ts  # Token rotation logic
│   │   └── refresh-token.schema.ts
│   └── types/
│       ├── auth.types.ts     # Role enum, JWTPayload, @CurrentUser
│       └── auth.dto.ts       # LoginDto
│
├── user/                      # User management module
│   ├── user.module.ts
│   ├── user.controller.ts
│   ├── user.service.ts        # User CRUD, password verification
│   └── user.schema.ts        # User mongoose schema
│
├── product/                   # Product management
│   ├── product.module.ts
│   ├── product.controller.ts
│   ├── product.service.ts
│   ├── product.schema.ts
│   └── types/
│       ├── product.dto.ts    # All product DTOs
│       └── product.types.ts  # Category enum
│
├── inventory-man/             # Inventory management (parent)
│   ├── inventory/
│   │   ├── inventory.module.ts
│   │   ├── inventory.controller.ts
│   │   ├── inventory.service.ts  # Stock level logic
│   │   ├── inventory.schema.ts
│   │   └── types/
│   ├── restock/
│   │   ├── restock.module.ts
│   │   ├── restock.controller.ts
│   │   ├── restock.service.ts
│   │   ├── restock.schema.ts
│   │   ├── restock-details.schema.ts
│   │   └── types/
│   └── adjustment/
│       ├── adjustment.module.ts
│       ├── adjustment.controller.ts
│       ├── adjustment.service.ts
│       ├── adjustment.schema.ts
│       ├── adjustment-details.schema.ts
│       └── types/
│
├── ean-counter/              # EAN barcode generation
│   ├── ean-counter.module.ts
│   ├── ean-counter.service.ts  # Generates valid EAN-13 codes
│   └── ean-counter.schema.ts
│
├── sales/                     # Sales/Point-of-sale
│   ├── sales.module.ts
│   ├── sales.controller.ts
│   ├── sales.service.ts
│   ├── sales.schema.ts
│   ├── sales-details.schema.ts
│   └── types/
│
└── common/                    # Shared utilities
    ├── base/
    │   ├── base.response.ts   # { data, message } wrapper
    │   └── base.controller.ts
    ├── utils/
    │   ├── db.ts              # runInTransaction helper
    │   └── cookie/
    │       ├── cookie.module.ts
    │       └── cookie.service.ts  # JWT/Refresh cookie handling
    ├── interceptors/
    │   ├── response.interceptor.ts
    │   └── timing.interceptor.ts
    ├── global/
    │   ├── global.filter.ts   # Global error handler
    │   └── mongo.filter.ts
    └── typed-config/
        ├── typed-config.module.ts
        ├── typed-config.service.ts
        └── validation.env.ts
```

---

## 5. How It All Fits Together

### Application Bootstrap (`main.ts`)

```typescript
// 1. Create NestJS Express app
const app = await NestFactory.create<NestExpressApplication>(AppModule);

// 2. Global validation pipe (transforms DTOs, strips unknown fields)
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  transformOptions: { enableImplicitConversion: true }
}));

// 3. Global interceptors (timing, response wrapping)
app.useGlobalInterceptors(new TimingInterceptor(), new ResponseInterceptor());

// 4. Cookie parser middleware with secret
app.use(cookieParser(config.get('COOKIE_SECRET')));

// 5. CORS configuration
app.enableCors({
  origin: process.env.NODE_ENV === 'production' ? frontendUrl : "http://localhost:5173",
  credentials: true
});

// 6. Listen on 0.0.0.0 for Railway compatibility
await app.listen(port, '0.0.0.0');
```

### Root Module (`app.module.ts`)

All modules are registered here. Also sets up global guards and filters:

```typescript
providers: [
  { provide: APP_GUARD, useClass: JWTAuthGuard },    // JWT for all routes
  { provide: APP_GUARD, useClass: RoleGuard },       // Role checking
  { provide: APP_FILTER, useClass: GlobalFilter },   // Error handling
]
```

---

## 6. Modules & Architecture

### Auth Module

Handles authentication with a dual-token system:

```
┌─────────────────────────────────────────────────────────┐
│                    Auth Flow                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Login Request                                           │
│       ↓                                                  │
│  AuthService.login()                                     │
│       ↓                                                  │
│  UserService.checkCredentials() ← verifies password      │
│       ↓                                                  │
│  RefreshTokenService.create() ← creates refresh token    │
│       ↓                                                  │
│  Signs JWT with userId, username, roles                  │
│       ↓                                                  │
│  CookieService.createJwt() ← sets signed HTTP cookie     │
│  CookieService.createRefresh() ← sets signed cookie      │
│  CookieService.createDummy() ← sets visible cookie       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Why cookies?**
The client stores JWT in a cookie (not localStorage) for security. The `dummy` cookie is read by the client to determine if the user is "authenticated" (since HTTP-only cookies aren't accessible to JavaScript).

### Product Module

```
┌─────────────────────────────────────────────────────────┐
│              Product Module                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  EAN System:                                             │
│  - EanCounterService generates unique EAN-13 codes       │
│  - Includes valid checksum calculation                    │
│  - Can validate existing EAN-13 codes                    │
│                                                          │
│  ProductService handles:                                 │
│  - getAll() - paginated list with filters                │
│  - getByBarcode() - find by EAN                         │
│  - createMany() - bulk insert with auto-EAN generation   │
│  - ensureValid() - check for duplicates before creating  │
│  - getMatches() - search for autocomplete                │
│                                                          │
│  When products are created:                              │
│  1. InventoryService.createMany() also called           │
│  2. Each product gets an inventory record with stock=0    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Inventory Module

Central hub for stock operations. All inventory modifications go through here:

```
┌─────────────────────────────────────────────────────────┐
│           Inventory Service Operations                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  getAll()                                                │
│    ├─ With maxStock: aggregate with product lookup      │
│    └─ Without: find by product IDs, populate product     │
│                                                          │
│  restock() → adds to stock                               │
│    └─ Used by RestockService                             │
│                                                          │
│  adjust() → adds or subtracts from stock                │
│    └─ Used by AdjustmentService                         │
│                                                          │
│  sell() → subtracts from stock                          │
│    └─ Used by SalesService                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Restock Module

Records inventory restocking operations:

```
Restock Schema:
  - description: What this restock is for
  - restockedBy: User who performed it
  - totalCost: Sum of (quantity × unitCost)

RestockDetails Schema:
  - restock: Parent Restock reference
  - product: Product reference
  - quantity: How many added
  - unitCost: Cost per unit at time of restock
```

### Adjustment Module

Records stock corrections/adjustments:

```
Adjustment Schema:
  - description: Reason for adjustment
  - adjustedBy: User who performed it

AdjustmentDetails Schema:
  - adjustment: Parent Adjustment reference
  - product: Product reference
  - change: Positive or negative number (must not be 0)
  - reason: Why the adjustment was made
```

### Sales Module

Records point-of-sale transactions:

```
Sales Schema:
  - amount: Total sale amount
  - cashier: User who made the sale
  - paymentType: Cash or Card
  - referenceNumber: Optional reference

SalesDetails Schema:
  - sales: Parent Sales reference
  - product: Product reference
  - quantity: Items sold
  - unitPrice: Price at time of sale
```

### EAN Counter Module

Generates valid EAN-13 barcodes:

```
┌─────────────────────────────────────────────────────────┐
│              EAN Generation Process                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Find counter document by ID (config: EAN_COUNTER_ID)│
│  2. Increment counter                                    │
│  3. Combine prefix + counter                              │
│  4. Calculate Luhn checksum digit                        │
│  5. Return 13-digit EAN                                  │
│                                                          │
│  Example:                                                │
│  prefix = 200, counter = 12345                          │
│  tempEAN = 200 * 10^5 + 12345 = 20012345                │
│  checksum = calculateLuhn(tempEAN) = 7                  │
│  final = 200123457 (13 digits)                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Authentication & Authorization

### Roles

```typescript
enum Role {
  Cashier = 'cashier',           // Can make sales
  Owner = 'owner',               // Full access
  InventoryManager = 'inventory manager',  // Inventory operations
  Unauthenticated = 'unauthenticated'  // For public routes
}
```

### Decorators

```typescript
@Public()                    // Skip JWT check (for login, logout, refresh)
@Roles(Role.Owner, Role.InventoryManager)  // Require specific roles
@CurrentUser() user          // Get current user from JWT payload
```

### JWT Guard Logic

```
Request comes in
       ↓
Extract signed JWT from cookie
       ↓
Validate signature and expiration
       ↓
If valid: attach user to request, proceed
If invalid:
  - Check @Public decorator → if set, return { roles: Role.Unauthenticated }
  - If not public → throw JWTInvalidError
```

### Role Guard Logic

```
Check if route has @Roles() decorator
       ↓
If no roles required → proceed
If roles required:
  - Get user.roles from request
  - Check if user has ANY required role
  - If yes → proceed
  - If no → throw UnauthorizedException
```

### Token Refresh Flow

```
1. Client detects 401 response
2. Client POSTs to /auth/refresh with refresh cookie
3. AuthController.refresh():
   a. Parse refresh cookie
   b. Extract refreshId
   c. RefreshTokenService.rotate(refreshId):
      - Find and delete old refresh token
      - Verify it's not expired
      - Create new refresh token
      - Return new JWT payload
   d. Set new JWT and refresh cookies
4. Client retries original request
```

---

## 8. API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login with username/password |
| POST | `/auth/refresh` | Public | Refresh JWT using refresh cookie |
| POST | `/auth/logout` | Public | Invalidate refresh token |

**Login Response:**
```json
{
  "data": {
    "user": { "username": "john" }
  }
}
```

### Products

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/products` | Owner, InvManager | List products (paginated) |
| GET | `/products/:EAN` | Owner, InvManager, Cashier | Get by barcode |
| POST | `/products/bulk` | Owner, InvManager | Create multiple products |
| PATCH | `/products` | Owner, InvManager | Update products |
| GET | `/products/matches` | Owner, InvManager | Search for autocomplete |
| GET | `/products/ensureValid` | Owner, InvManager | Check EAN/name availability |

**Query params for GET /products:**
```
?page=1&limit=10&name=MILK&EAN=123
```

### Inventories

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/inventories` | Owner, InvManager | List inventory with stock levels |

**Query params:**
```
?page=1&limit=10&name=MILK&EAN=123&maxStock=50
```
- `maxStock` filters for low stock items (stock ≤ value)

### Restocks

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/restocks` | Owner, InvManager | List restock history |
| POST | `/restocks` | Owner, InvManager | Create restock |
| GET | `/restocks/details/:id` | Owner, InvManager | Get restock line items |
| GET | `/restocks/users` | Owner, InvManager | Get users who restocked |

**Query params for GET /restocks:**
```
?page=1&limit=10&restockedBy=USER_ID&dateRange=2024-01-01,2024-01-31
```

**POST /restocks body:**
```json
{
  "restockDetails": [
    {
      "product": "PRODUCT_ID",
      "quantity": 10,
      "unitCost": 25.50
    },
    {
      "newProduct": { "name": "New Item", "price": 30 },
      "quantity": 5,
      "unitCost": 20
    }
  ],
  "description": "Weekly restock from supplier"
}
```

### Adjustments

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/adjustments` | Owner, InvManager | List adjustment history |
| POST | `/adjustments` | Owner, InvManager | Create adjustment |
| GET | `/adjustments/details/:id` | Owner, InvManager | Get adjustment details |
| GET | `/adjustments/users` | Owner, InvManager | Get users who adjusted |

**POST /adjustments body:**
```json
{
  "adjustDetails": [
    {
      "product": "PRODUCT_ID",
      "change": -5,
      "reason": "Damaged goods"
    }
  ],
  "description": "Monthly inventory count correction"
}
```

### Sales

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/sales` | Owner, Cashier | List sales |
| POST | `/sales` | Owner, Cashier | Record sale |
| GET | `/sales/details/:id` | Owner, Cashier | Get sale line items |

**POST /sales body:**
```json
{
  "paymentType": "cash",
  "referenceNumber": "REF-123",
  "sellDetails": [
    { "product": "PRODUCT_ID", "quantity": 2 }
  ]
}
```

**Response:**
```json
{
  "data": {
    "receipt": {
      "cashierName": "john",
      "items": [
        { "productName": "Milk 1L", "quantity": 2, "amount": 60 }
      ],
      "totalAmount": 60
    }
  }
}
```

---

## 9. Data Models

### User

```typescript
{
  name: string           // unique, lowercase, max 30 chars
  roles: Role[]          // array of roles
  passwordHash: string   // argon2 hashed password
  isActive: boolean      // deactivation flag
}
```

### Product

```typescript
{
  EAN: string            // unique, 13 char max, EAN-13 barcode
  name: string           // unique, uppercase, max 50 chars
  price: number          // min 0
  category?: Category    // optional category
}
```

### Inventory

```typescript
{
  product: ObjectId      // ref to Product, unique
  stock: number          // integer, min 0, default 0
  updatedBy: ObjectId    // ref to User (last modifier)
}
```

### Restock

```typescript
{
  description: string    // max 300 chars
  restockedBy: ObjectId  // ref to User
  totalCost: number      // min 0
  // timestamps: createdAt, updatedAt
}
```

### RestockDetails

```typescript
{
  restock: ObjectId      // ref to Restock
  product: ObjectId     // ref to Product
  quantity: number       // min 0
  unitCost: number       // min 0
}
```

### Adjustment

```typescript
{
  description: string    // max 300 chars
  adjustedBy: ObjectId   // ref to User
  // timestamps
}
```

### AdjustmentDetails

```typescript
{
  adjustment: ObjectId  // ref to Adjustment
  product: ObjectId     // ref to Product
  change: number         // integer, not zero
  reason: string         // max 100 chars
}
```

### Sales

```typescript
{
  amount: number         // min 0
  cashier: ObjectId      // ref to User
  paymentType: PaymentType  // cash | card
  referenceNumber?: string  // max 50 chars
  // timestamps
}
```

### SalesDetails

```typescript
{
  sales: ObjectId        // ref to Sales
  product: ObjectId      // ref to Product
  quantity: number       // integer, min 0
  unitPrice: number      // min 0
}
```

### RefreshToken

```typescript
{
  user: ObjectId         // ref to User
  expiry: Date           // expiration time
  isValid: boolean       // invalidation flag
}
```

### EANCounter

```typescript
{
  _id: string            // 'EAN_COUNTER_ID'
  counter: number        // increments on each generation
  prefix: number         // default 200 (country code)
}
```

---

## 10. Key Services

### CookieService

Manages HTTP cookies for auth tokens:

```typescript
createJwt(res, payload)      // Sets 'jwt' signed cookie
removeJwt(res)                // Clears 'jwt' cookie
createRefresh(res, payload)   // Sets 'refresh' signed cookie
removeRefresh(res)            // Clears 'refresh' cookie
createDummy(res)              // Sets 'dummy' visible cookie (for client auth check)
removeDummy(res)              // Clears 'dummy' cookie
```

### RefreshTokenService

Manages the refresh token lifecycle:

```typescript
create(userId)              // Creates new refresh token, returns ID
rotate(refreshId)            // Invalidates old, creates new, returns new tokens
invalidate(refreshId)       // Marks token as invalid
```

### runInTransaction

Helper for MongoDB transactions:

```typescript
await runInTransaction(async (session) => {
  // Do multiple operations in a transaction
  await model.create([...], { session });
  await model.bulkWrite([...], { session });
}, connection, existingSession?);
```

---

## 11. Common Patterns

### Controller Pattern

```typescript
@Controller('resource')
@Roles(Role.Owner, Role.InventoryManager)  // Default role requirement
export class ResourceController {
  constructor(private service: ResourceService) {}

  @Get()
  async getAll(@Query() dto: GetAllDto) {
    const data = await this.service.getAll(dto);
    return new BaseResponse(data);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateDto) {
    await this.service.create(user, dto);
    return new BaseResponse();
  }
}
```

### Service Pattern with Transactions

```typescript
async create(user: AuthUser, dto: CreateDto, session?: ClientSession) {
  await runInTransaction(async (session) => {
    // Create main record
    const [created] = await this.model.create([{...}], { session });

    // Create related records in bulk
    const inserts = details.map(d => ({
      insertOne: { document: { ..., parentId: created._id } }
    }));
    await this.detailsModel.bulkWrite(inserts, { session });

    // Update inventory (if applicable)
    await this.inventoryService.doSomething(dto, session);
  }, this.connection, session);
}
```

### Pagination Pattern

```typescript
async getAll(dto: GetAllDto) {
  const { page, limit, name, someFilter } = dto;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  if (name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.name = { $regex: `^${escaped}`, $options: 'i' };
  }

  // Run query and count in parallel
  const [data, totalItems] = await Promise.all([
    this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    this.model.countDocuments(query)
  ]);

  return { data, totalItems };
}
```

### DTO Validation Pattern

```typescript
export class CreateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  name: string

  @IsNumber()
  @Min(0)
  price: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[]
}
```

### Response Structure

All responses follow this pattern:

```json
{
  "data": { ... },
  "message": null
}
```

Controllers must return `BaseResponse` instances. The `ResponseInterceptor` validates this.

---

## Request/Response Example: Creating a Product

**Request:**
```
POST /products/bulk
Content-Type: application/json

{
  "newProducts": [
    { "name": "Fresh Milk 1L", "price": 45.50 },
    { "EAN": "1234567890123", "name": "Bread Loaf", "price": 35.00 }
  ]
}
```

**What happens:**
1. `ProductController.addMany()` receives DTO
2. `ProductService.addMany()` called
3. For items without EAN, `EanCounterService.generate()` creates one
4. `model.insertMany()` inserts all products
5. `InventoryService.createMany()` creates inventory records with stock=0

**Response:**
```json
{
  "data": null,
  "message": null
}
```

---

## Error Handling

The `GlobalFilter` catches all unhandled errors:

1. **JWTInvalidError** → 401 "Please log in again"
2. **MongoDB errors** → handled by `MongoFilter`
3. **Validation errors** → 400 with array of messages
4. **Other errors** → 500 "Internal Server Error"

All errors return:
```json
{
  "statusCode": 400,
  "method": "POST",
  "path": "/products/bulk",
  "message": ["name must be a string", "price must be a positive number"]
}
```

---

## Security Notes

1. **Passwords** - Hashed with Argon2 (not bcrypt or MD5)
2. **JWT** - Stored in HTTP-only signed cookie (not localStorage)
3. **Refresh Tokens** - Rotated on each use (rotation strategy)
4. **CORS** - Restricted to localhost in dev, frontend URL in prod
5. **Validation** - Unknown fields stripped, types auto-converted

---

*Last updated: April 2026*
*Version: 0.0.1*