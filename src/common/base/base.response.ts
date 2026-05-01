export class BaseResponse<T> {
    data: T | null;
    message: string | null;

    constructor(data?: T, message?: string) {
        this.data = data ?? null;
        this.message = message ?? null;
    }
}
