import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import * as argon from 'argon2'
import { JWTPayload } from 'src/auth/types/auth.enum';
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private model: Model<User>,
    ) {}

    async checkCredentials(username: string, password :string)
    : Promise<JWTPayload | null> {
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

        return { username: user.name, roles: user.roles }
    }
}
