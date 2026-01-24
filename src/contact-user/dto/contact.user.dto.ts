import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ContactUsDto {
    @ApiProperty({
        example: 'John',
        description: 'User first name',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        example: 'Doe',
        description: 'User last name',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'User email address',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({
        example: '+8801712345678',
        description: 'User phone number (optional)',
    })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiPropertyOptional({
        example: 'HOMEOWNER',
        description: 'User type (e.g. HOMEOWNER, CONTRACTOR)',
    })
    @IsString()
    @IsOptional()
    userType?: string;

    @ApiProperty({
        example: 'Support',
        description: 'Subject or topic of the message',
    })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({
        example: 'I am facing an issue with my account.',
        description: 'User message details',
    })
    @IsString()
    @IsNotEmpty()
    message: string;
}