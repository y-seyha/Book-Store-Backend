import {Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    hanndleRequest(err, user,info){
        if(err || user)
            throw  err || new UnauthorizedException("Invalid or expired refresh token");

        return user;
    }
}

