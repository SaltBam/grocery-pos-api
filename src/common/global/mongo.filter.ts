import { BadRequestException, Logger } from "@nestjs/common";
import de from "zod/v4/locales/de.js";

export class MongoFilter {
    static catch(err) {
        switch (Number(err.code)) {
            case 11000:
                this.duplicate(err);
            default:
                Logger.log('-> NOT CAUGHT BY SPECIFIC MONGO FILTER')
                throw err
        }
    }

    private static duplicate(err) {
        Logger.log('-> DUPLICATE FILTER')
        const baseErrMsg = 'Already exsists';
        const getKey = (origMsg: string) => 
            origMsg.split('dup key: { ')[1].split(':')[0]
        
        if (err?.name === 'MongoBulkWriteError') {
            Logger.log('==>> BulkWrite');

            const details = err.writeErrors.map(
                ({err}) => ({
                    msg: baseErrMsg,
                    _id: err.op.q._id,
                    property: getKey(err.errmsg)
                })
            );
            
            throw new BadRequestException(details);
        } else if (err?.name === 'MongoServerError') {
            Logger.log('==>> Server');
            
            const details = [{
                msg: baseErrMsg,
                property: getKey(err.errorResponse.errmsg)
            }];

            throw new BadRequestException(details);
        }
    }
}