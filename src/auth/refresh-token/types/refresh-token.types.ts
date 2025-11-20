import { Types } from "mongoose";

export class RefreshPayload {
    _id: Types.ObjectId;
    token: string;
    userId: Types.ObjectId;
}