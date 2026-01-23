import { ApiProperty } from '@nestjs/swagger';

export class FaqBodyDto {
    @ApiProperty({
        example: 'How does this work?',
        description: 'FAQ question',
    })
    question: string;

    @ApiProperty({
        example: 'You can post a job and receive bids.',
        description: 'FAQ answer',
    })
    ans: string;
}
