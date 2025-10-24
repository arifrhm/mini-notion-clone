import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';
import { BlockType } from '../block.entity';

export class CreateBlockDto {
  @IsEnum(BlockType)
  type: BlockType;

  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  parent_id?: number;

  @IsNumber()
  order_index: number;
}
