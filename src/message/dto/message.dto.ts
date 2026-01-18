import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Receiver user ID',
    example: '46753251-6f77-4134-933a-e4bf3af629d5',
  })
  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @ApiProperty({
    description: 'Message text',
    example: 'Hello, how are you?',
  })
  @IsNotEmpty()
  @IsString()
  text: string;
}
