import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {Observable} from "rxjs";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector : Reflector) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requriedRoles = this.reflector.get<string[]>('roles',context.getHandler())

        if(!requriedRoles || requriedRoles.length === 0)
            return false;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(!user)
            throw new ForbiddenException('User is not authenticated');

        return true;
    }
}