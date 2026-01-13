import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsInt,
    IsArray,
    Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateJobDto {
    @ApiProperty()
    @IsString()
    jobTitle: string;

    @ApiProperty()
    @IsString()
    jobType: string;

    @ApiProperty()
    @IsString()
    projectDescription: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return [value];
            }
        }
        return value;
    })
    technicalRequirementsAndCertifications: string[];

    @ApiProperty()
    @IsString()
    elevatorType: string;

    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    numberOfElevator: number;

    @ApiProperty()
    @IsString()
    capacity: string;

    @ApiProperty()
    @IsString()
    speed: string;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty()
    @IsString()
    streetAddress: string;

    @ApiProperty()
    @IsString()
    city: string;

    @ApiProperty()
    @IsString()
    zipCode: string;

    @ApiProperty()
    @IsString()
    estimatedBudget: string;
}
