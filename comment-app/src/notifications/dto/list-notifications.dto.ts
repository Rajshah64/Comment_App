import { IsBoolean, IsOptional } from 'class-validator';

export class ListNotificationsDto {
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}
