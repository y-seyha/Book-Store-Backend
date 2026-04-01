import {IsEmail, IsNotEmpty, MinLength} from 'class-validator';

export class ResetpasswordDto {
    @IsNotEmpty({ message: 'Verification token is required' })
    token: string;

    // @IsEmail({}, { message: 'Please provide a valid email' })
    // email: string;

    @IsNotEmpty({message : 'Password is required'})
    @MinLength(5, { message: 'Password must be at least 6 characters long' })
    newPassword: string;
}