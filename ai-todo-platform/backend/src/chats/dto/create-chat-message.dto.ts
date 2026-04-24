import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChatMessageDto {
  @ApiPropertyOptional({ description: 'Existing chat to continue' })
  @IsOptional()
  @IsMongoId()
  chatId?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message: string;
}
