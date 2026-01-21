import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateHeroDto {
    @ApiProperty({ example: 'Elite Elevator Solutions' })
    @IsString()
    @IsNotEmpty()
    tagline: string;

    @ApiProperty({ example: 'Modern Elevator Solutions' })
    @IsString()
    @IsNotEmpty()
    mainTitle: string;

    @ApiProperty({ example: 'The premier marketplace...' })
    @IsString()
    @IsNotEmpty()
    subtitle: string;

    @ApiProperty({ example: 'Post an Elevator Job' })
    @IsString()
    @IsNotEmpty()
    primaryCTA: string;

    @ApiProperty({ example: 'Find Elevator Work' })
    @IsString()
    @IsNotEmpty()
    secondaryCTA: string;
}