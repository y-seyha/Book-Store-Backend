import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateDriverDto {

    @ApiPropertyOptional({
        example: 'driver@gmail.com',
        description: 'Driver email'
    })
    @IsOptional()
    @IsEmail()
    email?: string;

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

    // 🚚 DRIVER INFO
    @ApiPropertyOptional({
        example: '1AB-1234',
        description: 'Vehicle plate number'
    })
    @IsOptional()
    @IsString()
    plate_number?: string;

    @ApiPropertyOptional({
        example: 'Honda Click 125',
        description: 'Vehicle type'
    })
    @IsOptional()
    @IsString()
    vehicle_type?: string;

    @ApiPropertyOptional({
        example: true,
        description: 'Driver availability status'
    })
    @IsOptional()
    is_available?: boolean;
}