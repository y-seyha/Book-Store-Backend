import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import { Strategy } from 'passport-jwt';


@Injectable()
export class  JwtStrategy extends  PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: (req) => req?.cookies?.['access_token'],
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET!,
        });
    }

    async validate(payload: any) {
        try{
            return {id : payload.userId, role : payload.role};

        }catch (e){
            throw new UnauthorizedException('Invalid token')
        }
    }
}