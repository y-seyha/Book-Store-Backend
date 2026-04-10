import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
    @ApiProperty({
        description: 'Name of the person contacting',
        example: 'John Doe',
        maxLength: 100,
    })
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @MaxLength(100, { message: 'Name can be max 100 characters' })
    name: string;

    @ApiProperty({
        description: 'Email of the person contacting',
        example: 'john@example.com',
        maxLength: 150,
    })
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    @MaxLength(150, { message: 'Email can be max 150 characters' })
    email: string;

    @ApiProperty({
        description: 'Subject of the contact message',
        example: 'Question about your bookstore',
        maxLength: 200,
    })
    @IsString({ message: 'Subject must be a string' })
    @IsNotEmpty({ message: 'Subject is required' })
    @MaxLength(200, { message: 'Subject can be max 200 characters' })
    subject: string;

    @ApiProperty({
        description: 'Message body',
        example: 'Hello, I want to ask about your new book arrivals.',
    })
    @IsString({ message: 'Message must be a string' })
    @IsNotEmpty({ message: 'Message is required' })
    message: string;
}