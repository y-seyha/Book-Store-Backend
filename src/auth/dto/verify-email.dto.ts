import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDTO {
    @ApiProperty({ description: 'Verification token sent to email', example: 'abcd1234' })
    @IsNotEmpty({ message: 'Verification token is required' })
    token: string;
}