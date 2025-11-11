export class BaseResponse<T> {
    data: T | null;
    message: string | null;

    constructor(
        data: T | null, message: string | null
    ) {
        this.data = data;
        this.message = message;
    }
}