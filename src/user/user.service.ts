import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import * as argon from 'argon2'
import { Role } from 'src/auth/types/auth.types';
import { CreateBulkDto, UpdateBulkDto } from './types';
import { runInTransaction } from 'src/common/utils/db';

class UserInfo {
    name: string;
    roles: Role[];
    _id: Types.ObjectId;
    isActive: boolean;
}

@Injectable()
export class UserService {
    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(User.name) private model: Model<User>,
    ) {}

    async get(): Promise<UserInfo[]> {
        return this.model
            .find()
            .select('-passwordHash -__v')
            .lean();
    }

    async update(dto: UpdateBulkDto, session?: ClientSession): Promise<void> {
        const updates = await this.prepareUpdates(dto);
        
        return await runInTransaction(async (session) => {
            await this.model.bulkWrite(updates, { session });
        }, this.connection, session);
    }

    private async prepareUpdates(dto: UpdateBulkDto) {
        const newDto = await Promise.all(
            dto.updates.map(async ({_id, update}) => {
                const newUpdate: any = {...update};

                if (newUpdate.password) {
                    let passwordHash = await argon.hash(newUpdate.password);
                    newUpdate.passwordHash = passwordHash
                    delete newUpdate.password;
                }

                return {_id, newUpdate}
            })
        );

        return newDto.map(({_id, newUpdate}) => ({
            updateOne: {
                filter: { _id },
                update: { $set: newUpdate }
            }
        }));
    }

    async create(dto: CreateBulkDto, session?: ClientSession): Promise<void> {
        const inserts = await Promise.all(
            dto.users.map(async (user) => ({
                name: user.name,
                passwordHash: await argon.hash(user.password),
                roles: user.roles
            })
        ));

        await runInTransaction(async(session) => {
            await this.model.insertMany(inserts, { session });
        }, this.connection, session);
    }

    async checkCredentials(username: string, password :string)
    : Promise<UserInfo | null> {
        const user = await this.model
            .findOne({ name: username })
            .lean();
        
        if (!user) {
            return null;
        }

        const isMatch = await argon.verify(user.passwordHash, password);
        if (!isMatch) {
            return null;
        }

        return { 
            name: user.name, roles: user.roles, 
            _id: user._id, isActive: user.isActive 
        };
    }

    async checkActivated(username: string): Promise<boolean> {
        const user = await this.model
            .findOne({ name: username, isActive: true })
            .lean();
        
        return !!user
    }

    async getName(user: Types.ObjectId) {
        const found = await this.model
            .findById({ _id: user })
            .select('name')
            .lean()

        return found?.name ?? 'N/A';
    }
}
