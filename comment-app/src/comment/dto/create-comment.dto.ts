import { IsOptional, IsUUID, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsString()
  content: string;
}
