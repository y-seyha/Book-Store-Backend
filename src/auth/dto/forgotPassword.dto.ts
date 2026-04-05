import { IsEmail } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'Email address of the user who wants to reset password',
        example: 'user@example.com',
    })
    @IsEmail({}, { message: 'Please provide a valid email' })
    email: string;
}