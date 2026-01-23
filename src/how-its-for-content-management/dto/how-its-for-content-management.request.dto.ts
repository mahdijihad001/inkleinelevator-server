import { ApiProperty } from '@nestjs/swagger';
import { AudienceType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHowItsForDto {
    // @IsString()
    // @IsNotEmpty()
    // how_its_for_key: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    label: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    subtitle?: string;
}




export class UpdateHowItsForDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    label?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    subtitle?: string;
}



export class CreateHowItsForCardDto {
    @ApiProperty()
    @IsEnum(AudienceType)
    type: AudienceType;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cardTitle: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    cardSubtitle?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    bulletText: string;
};



export class UpdateHowItsForCardDto {
    @ApiProperty()
    @IsOptional()
    @IsEnum(AudienceType)
    type?: AudienceType;

    @ApiProperty()
    @IsOptional()
    @IsString()
    cardTitle?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    cardSubtitle?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    bulletText?: string;
}
