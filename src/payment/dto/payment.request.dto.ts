import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class createPaymentDto {
    @ApiProperty({
        example: 200
    })
    @IsNotEmpty()
    @IsNumber()
    amount: number;


    @ApiProperty({
        example: "12121212124121"
    })
    @IsNotEmpty()
    @IsString()
    jobId: string

    @ApiProperty({
        example: "12121212124121"
    })
    @IsNotEmpty()
    @IsString()
    bidId: string
}