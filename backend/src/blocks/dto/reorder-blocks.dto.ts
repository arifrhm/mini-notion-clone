import { IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class BlockOrder {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  order_index: number;
}

export class ReorderBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockOrder)
  blocks: BlockOrder[];
}
