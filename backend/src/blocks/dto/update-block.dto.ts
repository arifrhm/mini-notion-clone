import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';
import { BlockType } from '../block.entity';

export class UpdateBlockDto {
  @IsEnum(BlockType)
  @IsOptional()
  type?: BlockType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  parent_id?: number;

  @IsNumber()
  @IsOptional()
  order_index?: number;

  @IsString()
  @IsOptional()
  expected_updated_at?: string;
}
