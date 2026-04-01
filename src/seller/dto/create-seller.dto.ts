import { IsNotEmpty, IsOptional, IsString, MaxLength, IsPhoneNumber, IsUrl } from 'class-validator';

export class CreateSellerDto {
    @IsNotEmpty({ message: 'Store name is required' })
    @IsString({ message: 'Store name must be a string' })
    @MaxLength(100, { message: 'Store name cannot exceed 100 characters' })
    store_name: string;

    @IsOptional()
    @IsString({ message: 'Store description must be a string' })
    @MaxLength(500, { message: 'Store description cannot exceed 500 characters' })
    store_description?: string;

    @IsOptional()
    @IsString({ message: 'Store address must be a string' })
    @MaxLength(200, { message: 'Store address cannot exceed 200 characters' })
    store_address?: string;

    @IsOptional()
    @IsString()  // no phone validation for now
    phone?: string;

    /** Logo URL of the store */
    @IsOptional()
    @IsUrl({}, { message: 'Logo URL must be a valid URL' })
    logo_url?: string;
}