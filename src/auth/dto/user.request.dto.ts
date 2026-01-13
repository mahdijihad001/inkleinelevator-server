import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { Role } from 'generated/prisma/enums';

export class SignUpDto {
    @ApiProperty({ example: 'Mohammad Jihad' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'user@gmail.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: '0178221212121' })
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty({ example: '12345678' })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({ enum: Role })
    @IsEnum(Role)
    role: Role;

    @ApiPropertyOptional({ example: 'ABC Elevator Ltd' })
    @IsOptional()
    @IsString()
    companyName?: string;

    // @ApiPropertyOptional({ example: 'https://logo.url' })
    // @IsOptional()
    // @IsString()
    // licenseInfo?: string;

    // @ApiPropertyOptional({ example: 'https://logo.url' })
    // @IsOptional()
    // @IsString()
    // businessLogo?: string;
};


export class SignInDto {
    @ApiProperty({
        example: "user@gmail.com"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty({
        example: "12345678"
    })
    @IsNotEmpty()
    @IsString()
    password: string
}