import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateAboutDto {
    @ApiProperty({ example: 'About Our Company' })
    @IsString()
    @IsNotEmpty()
    sectionLabel: string;

    @ApiProperty({ example: 'Who We Are' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: 'We provide modern elevator solutions for residential and commercial buildings.',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'Learn More' })
    @IsString()
    @IsNotEmpty()
    ctaButtonText: string;

    @ApiProperty({ example: 120 })
    @IsInt()
    @Min(0)
    StatisticsNumber: number;

    @ApiProperty({ example: 'Projects Completed' })
    @IsString()
    @IsNotEmpty()
    StatisticsLable: string;
}
