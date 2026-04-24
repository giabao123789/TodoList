import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateTodosDto {
  @ApiProperty({ example: 'Learn JavaScript in 7 days' })
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  goal: string;
}
