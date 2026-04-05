import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetpasswordDto {
    @ApiProperty({ description: 'Verification token sent to email', example: 'abcd1234' })
    @IsNotEmpty({ message: 'Verification token is required' })
    token: string;

    @ApiProperty({ description: 'New password', minLength: 6, example: 'newpassword123' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    newPassword: string;
}