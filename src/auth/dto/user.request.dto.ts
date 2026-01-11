import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"


export class SignUpDto {
    @ApiProperty({ example: "Mohammad Jihad" })
    @IsNotEmpty({ message: "Name must be required." })
    @IsString()
    name: string

    @ApiProperty({
        example: "user@gmail.com"
    })
    @IsNotEmpty({
        message: "Email must be required"
    })
    @IsEmail()
    email: string

    @ApiProperty({
        example: "0178221212121"
    })
    @IsNotEmpty({
        message: "Phone No Must be required"
    })
    @IsString()
    phone: string

    @ApiProperty({
        example: "12345678"
    })
    @IsNotEmpty({
        message: "Phone No Must be required"
    })
    @IsString()
    password: string


    @ApiProperty({
        example: "USER OR ELEVATOR"
    })
    @IsNotEmpty({
        message: "Role must be required"
    })
    @IsString()
    role: string

    @ApiPropertyOptional({
        example : "If you are an elevator company"
    })
    @IsOptional()
    @IsString()
    companyName: string

    @ApiPropertyOptional({
        example : "if you are an elevator company"
    })
    @IsOptional()
    @IsString()
    license: string
}