import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateDriverWithUserDto {

    @ApiProperty({
        example: 'driver@gmail.com',
        description: 'Driver email (used for login)'
    })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({
        example: 'John',
        description: 'First name of driver'
    })
    @IsOptional()
    @IsString()
    first_name?: string;

    @ApiPropertyOptional({
        example: 'Doe',
        description: 'Last name of driver'
    })
    @IsOptional()
    @IsString()
    last_name?: string;

    @ApiPropertyOptional({
        example: '+85512345678',
        description: 'Phone number of driver'
    })
    @IsOptional()
    @IsString()
    phone?: string;

    // DRIVER INFO
    @ApiProperty({
        example: '1AB-1234',
        description: 'Vehicle plate number'
    })
    @IsString()
    plate_number: string;

    @ApiPropertyOptional({
        example: 'Honda Click 125',
        description: 'Vehicle type'
    })
    @IsOptional()
    @IsString()
    vehicle_type?: string;
}