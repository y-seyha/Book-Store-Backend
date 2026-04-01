import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookOAuthStrategy extends PassportStrategy(FacebookStrategy, 'facebook') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            callbackURL: process.env.FACEBOOK_CALLBACK_URI!,
            profileFields: ['id', 'emails', 'name', 'picture.type(large)'], // Facebook-specific
            scope: ['email'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any, // use 'any' if TS complains
        done: (err: any, user?: any) => void,
    ) {
        try {
            const user = await this.authService.validateOAuthLogin(
                profile,
                accessToken,
                refreshToken,
                'facebook',
            );
            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }
}