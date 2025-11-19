import { Types } from "mongoose";

export class RefreshPayload {
    id: Types.ObjectId;
    token: string;
    userId: Types.ObjectId;
}