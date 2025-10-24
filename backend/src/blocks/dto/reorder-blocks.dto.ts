import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BlockOrder {
  id: number;
  order_index: number;
}

export class ReorderBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockOrder)
  blocks: BlockOrder[];
}
