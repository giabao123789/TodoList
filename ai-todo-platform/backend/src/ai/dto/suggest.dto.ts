import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SuggestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Extra context from other todos' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  context?: string;
}
