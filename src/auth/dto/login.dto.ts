import {IsEmail, IsNotEmpty, MinLength} from "class-validator";


export class  LoginDto {
    @IsEmail({}, {message : 'Please provide a valid emal'})
    email: string;

    @IsNotEmpty({message : 'Password is required'})
    @MinLength(5, { message: 'Password must be at least 6 characters long' })
    password: string;
}