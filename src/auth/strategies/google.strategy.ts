import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy, VerifyCallback} from "passport-google-oauth20";
import {AuthService} from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy , 'google'){
    constructor(private readonly  authService : AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URI!,
            scope: ['email', 'profile'],

            // passReqToCallback: true,
        });
    }

    async validate(accessToken : string, refreshToken : string, profile : any, done : VerifyCallback) {
        console.log('--- Google Profile ---');
        console.log(profile);  // This contains email, name, id, etc.

        console.log('--- Tokens ---');
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        try{
            const user = await  this.authService.validateOAuthLogin(profile, accessToken, refreshToken);
            done(null, user);
        }catch (err){
            done(err,false)
        }
    }
}