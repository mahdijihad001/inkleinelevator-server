import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";



export class createBid {
    @ApiProperty({ example: "1234567890" })
    @IsNotEmpty()
    @IsString()
    jobId: string;

    @ApiProperty({ example: 2000 })
    @IsNotEmpty()
    @IsNumber()
    bidAmount: number;

    @ApiProperty({ example: "01-01-2027" })
    @IsNotEmpty()
    @IsString()
    completionTimeline: string;

    @ApiProperty({ example: 4, description: "Number of weeks to complete" })
    @IsNotEmpty()
    @IsNumber()
    timeline: number;

    @ApiProperty({ example: "Short proposal description" })
    @IsNotEmpty()
    @IsString()
    brefProposal: string;
}



export class acceptJobBid {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: "05df6f1e-881d-4ef6-a710-77866c6f387d"
    })
    jobId: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: "f43242aa-5009-44e9-9698-d7287e2cf61c"
    })
    bidId: string
}