import { Injectable} from "@nestjs/common";
import {ThrottlerException, ThrottlerGuard} from "@nestjs/throttler";
//Custom Throttler Example
@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard{

    protected async  getTracker(req : Record<string,any>) : Promise<string>{
        const email = req.body?.email || 'anonymous';

        return `login-${email}`;
    }

    protected async  getLimit() : Promise<number>{
        return Promise.resolve(5); //set limit of 5
    }

    protected getTtl()  : Promise<number>{
        return Promise.resolve(60000); //window time for 1mn
    }

    protected async  throwThrottlingException() : Promise<void>{
        throw new ThrottlerException(`Too many attempts. Please try again after 1 minute.`)
    }
}