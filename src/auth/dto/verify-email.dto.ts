import { IsNotEmpty } from 'class-validator';

export class VerifyEmailDTO {
    @IsNotEmpty({ message: 'Verification token is required' })
    token: string;
}