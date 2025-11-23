import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import * as argon from 'argon2'
import { Role } from 'src/auth/types/auth.types';
import { CreateReq, UpdateManyReq } from './types';

class UserInfo {
    name: string;
    roles: Role[];
    _id: Types.ObjectId;
    isActive: boolean;
}

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private model: Model<User>,
    ) {}

    async getAll(): Promise<UserInfo[]> {
        return this.model
            .find()
            .select('-passwordHash -__v')
            .lean();
    }

    async updateMany(dto: UpdateManyReq[]): Promise<void> {
        const newDto = await Promise.all(
            dto.map(async ({_id, update}) => {
                const newUpdate: any = {...update};

                if (newUpdate.password) {
                    let passwordHash = await argon.hash(newUpdate.password);
                    newUpdate.passwordHash = passwordHash
                    delete newUpdate.password;
                }

                return {_id, newUpdate}
            })
        );

        const updates = newDto.map(({_id, newUpdate}) => ({
            updateOne: {
                filter: { _id },
                update: { $set: newUpdate }
            }
        }));

        await this.model.bulkWrite(updates);
    }

    async create(dto: CreateReq): Promise<void> {
        const { name, password, roles } = dto;

        const passwordHash = await argon.hash(password);

        await this.model.create({
            name, passwordHash, roles
        });
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
}
