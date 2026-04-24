import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class DeadlineDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({
    description: 'ISO date if user already picked one',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  existingDeadline?: string;
}
