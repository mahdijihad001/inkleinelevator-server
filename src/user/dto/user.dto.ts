import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export enum UserVerifiedStatus {
    VERIFID = "VERIFID",
    SUSPEND = "SUSPEND",
    DECLINT = "DECLINT",
    REQUEST = "REQUEST",
}

export class UpdateUserVerifiedStatusDto {
    @ApiProperty({
        enum: UserVerifiedStatus,
        example: UserVerifiedStatus.VERIFID,
    })
    @IsNotEmpty()
    @IsEnum(UserVerifiedStatus)
    statusType: UserVerifiedStatus;
}


export class UpdateUserProfileDto {
    @ApiPropertyOptional({ example: "John Doe" })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;
    @ApiPropertyOptional({ example: "01783542312212" })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    phone?: string;
    @ApiPropertyOptional({ example: "email@gmail.com" })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    email?: string;

    @ApiPropertyOptional({ example: "Acme Elevator Ltd" })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    companyName?: string;

    @ApiPropertyOptional({ example: "https://example.com/logo.png" })
    @IsOptional()
    @IsString()
    businessLogo?: string;

    @ApiPropertyOptional({ example: "Licensed elevator service provider" })
    @IsOptional()
    @IsString()
    companyDescription?: string;

    @ApiPropertyOptional({ example: "Maintenance, Installation" })
    @IsOptional()
    @IsString()
    servicesType?: string;

    @ApiPropertyOptional({ example: "2015" })
    @IsOptional()
    @IsString()
    yearFounded?: string;

    @ApiPropertyOptional({ example: "50" })
    @IsOptional()
    @IsString()
    numberOfEmployee?: string;

    @ApiPropertyOptional({ example: "https://company.com" })
    @IsOptional()
    @IsUrl()
    website?: string;

    @ApiPropertyOptional({ example: "Dhaka, Bangladesh" })
    @IsOptional()
    @IsString()
    businessAddress?: string;

    @ApiPropertyOptional({ example: "LIC-2024-XYZ" })
    @IsOptional()
    @IsString()
    licenseNo?: string;

    @ApiPropertyOptional({ example: "Government issued elevator license" })
    @IsOptional()
    @IsString()
    licenseInfo?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isNotification?: boolean;
}