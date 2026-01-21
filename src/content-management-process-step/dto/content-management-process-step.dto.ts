import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateHowItWorksDto {
    @ApiProperty({ example: 'How It Works Section' })
    @IsString()
    @IsNotEmpty()
    sectionLabel: string;

    @ApiProperty({ example: 'How Our Elevator Service Works' })
    @IsString()
    @IsNotEmpty()
    sectionTitle: string;
}


export class CreateHowItWorksStepDto {
    @ApiProperty({ example: 'Post Your Elevator Job' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Describe your elevator installation or maintenance needs.' })
    @IsString()
    @IsNotEmpty()
    description: string;
}