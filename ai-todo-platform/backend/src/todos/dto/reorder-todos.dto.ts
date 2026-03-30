import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsMongoId } from 'class-validator';

export class ReorderTodosDto {
  @ApiProperty({ type: [String], description: 'Todo ids in desired order' })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  orderedIds: string[];
}
