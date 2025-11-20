import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import * as argon from 'argon2'
import { Role } from 'src/auth/types/auth.types';
import { UpdateManyReq } from './types';

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

    async updateMany(dto: UpdateManyReq[]): Promise<UserInfo[]> {
        //Note: catch error where name is taken
        const updates = dto.map(({ _id, update }) => ({
            updateOne: {
                filter: { _id },
                update: { $set: update }
            }
        }));

        await this.model.bulkWrite(updates);

        return this.getAll();
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
