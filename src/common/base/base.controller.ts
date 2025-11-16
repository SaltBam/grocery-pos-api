import { Controller } from '@nestjs/common';
import { BaseResponse } from './base.response';

@Controller()
export abstract class BaseController {
    protected formatResponse<T>(
        response: BaseResponse<T>
    ): BaseResponse<T> {
        return new BaseResponse(
            response.data ?? undefined,
            response.message ?? undefined
        );
    }
}
