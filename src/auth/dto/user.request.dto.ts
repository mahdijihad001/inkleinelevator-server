import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

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


export class UserSignUpDto {

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

    @IsOptional()
    @IsEnum(Role)
    role: Role;
}


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
};


export class ChangePasswordDto {
    @ApiProperty({
        example: "12345678"
    })
    @IsString()
    oldPassword: string;

    @ApiProperty({
        example: "12345678"
    })
    @IsString()
    @MinLength(8)
    newPassword: string;
}

export class ForgotPasswordDto {
    @ApiProperty({
        example: "email@gmail.com"
    })
    @IsString()
    email: string;
}
export class verifyOtp {
    @ApiProperty({
        example: "email@gmail.com"
    })
    @IsString()
    email: string;
    @ApiProperty({
        example: "123456"
    })
    @IsString()
    otp: string;
}

export class ChangePassword {
    @ApiProperty({
        example: "1234567"
    })
    @IsString()
    password: string;
    @ApiProperty({
        example: "toekn"
    })
    @IsString()
    token: string;
}