import mongoose from "mongoose";
import { Role } from "./src/auth/types/auth.types";
import { User, UserSchema } from "./src/user/user.schema";
import * as argon from 'argon2';

const user = mongoose.model(User.name, UserSchema);

seedAll()
    .then(() => {
        console.log('Seeding complete...');
    }).catch((err) => {
        console.log('Error in seeding: ', err);
    }).finally(() => {
        process.exit(0);
    })

async function seedAll() {
    await mongoose.connect('mongodb://127.0.0.1/grocery');

    await seedUser();
    await mongoose.disconnect();
}

async function seedUser() {
    const hash = await argon.hash('a');

    let users = Object.keys(Role).map((key) => ({
        name: key,
        passwordHash: hash,
        roles: [Role[key]]
    }));

    const inactives = Object.keys(Role).map((key) => ({
        name: key + '1',
        passwordHash: hash,
        roles: [Role[key]],
        isActive: false
    }))

    users = users.concat(inactives);

    console.log(users);
    await user.collection.drop();
    return await user.insertMany(users);
}